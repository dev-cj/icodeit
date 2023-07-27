import dockernames from 'docker-names';
import Docker from 'dockerode';
import type { Container, Volume, Network } from 'dockerode';
import logger from '../../config/logger';
import { PlaygroundBase, removePlayground } from './base';
import { isProduction } from '../../config/config';

const docker = new Docker();

interface info {
  name: string;
  id: string;
}
interface DockerService<T> extends info {
  instance: T;
}

interface DirectoryService extends DockerService<Container> {
  explorerPort: string;
  webPort: string;
}

const CODE_SERVICE_IMAGE = 'vite_react_code';
const DIRECTORY_SERVICE_IMAGE = 'vite_react_directory_service';

const portMap = {
  explorerPort: '8002/tcp',
  webPort: '1337/tcp',
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export class ViteReact extends PlaygroundBase {
  private coderService: DockerService<Container>;
  private directoryService: DirectoryService;
  private volume: DockerService<Volume>;
  private network: DockerService<Network>;

  isRunning: boolean;
  filesGetUrl: string;
  filesPutUrl: string;

  constructor(playgroundId: string, filesGetUrl: string, filesPutUrl: string) {
    super(playgroundId);
    this.coderService = {
      name: '',
      id: '',
      instance: null,
    };
    this.directoryService = {
      name: '',
      id: '',
      instance: null,
      explorerPort: '',
      webPort: '',
    };
    this.volume = {
      name: '',
      id: '',
      instance: null,
    };
    this.network = {
      name: '',
      id: '',
      instance: null,
    };
    this.isRunning = false;
    this.filesGetUrl = filesGetUrl;
    this.filesPutUrl = filesPutUrl;
  }

  private allotNames() {
    this.coderService.name = this.playgroundName;
    this.directoryService.name = 'coder_' + dockernames.getRandomName();
    this.volume.name = 'volume_' + this.coderService.name + '_' + this.directoryService.name;
    this.network.name = 'network_' + this.coderService.name + '_' + this.directoryService.name;
  }
  private async createNetwork() {
    await docker
      .createNetwork({ Name: this.network.name })
      .then((result) => {
        this.network.id = result.id;
        this.network.instance = result;
      })
      .catch((err) => {
        if (err) {
          throw Error('Error Creating Network');
        }
      });
  }

  private async createVolume() {
    await docker
      .createVolume({
        Name: this.volume.name,
      })
      .then((result) => {
        this.volume.instance = docker.getVolume(result.Name);
      })
      .catch((error) => {
        if (error) {
          throw Error('Error creating volume');
        }
      });
  }

  private async startCodeService() {
    await docker
      .createContainer({
        Image: CODE_SERVICE_IMAGE,
        name: this.coderService.name,
        Volumes: {
          [this.volume.name]: {
            [this.volume.name]: '/home/coder/code',
          },
        },
        HostConfig: {
          // AutoRemove: true,
          Binds: [`${this.volume.name}:/home/coder/code`],
          Memory: 419430400, // 400 MB
        },
      })
      .then((container) => {
        this.coderService.id = container.id;
        this.coderService.instance = container;
        this.network.instance.connect(
          {
            Container: container.id,
          },
          (err) => {
            if (err) {
              throw Error('Error connecting container 1 to network');
            }
          }
        );
        container.start({}, (err) => {
          if (err) {
            throw Error('Error starting container 1');
          }
        });
      })
      .catch((err) => {
        throw Error(`Error creating container 1 ${err}`);
      });
  }

  private async startDirectoryService() {
    await docker
      .createContainer({
        Image: DIRECTORY_SERVICE_IMAGE,
        name: this.directoryService.name,
        Env: [
          `codeservicename=${this.coderService.name}`,
          `FILES_PUT_URL=${this.filesPutUrl}`,
          `FILES_GET_URL=${this.filesGetUrl}`,
        ],
        Volumes: {
          [this.volume.name]: {
            [this.volume.name]: '/home/coder/code',
          },
        },
        Labels: isProduction
          ? {
              // labels for traefik
              'traefik.enable': 'true',
              [`traefik.http.routers.${this.directoryService.name}.rule`]: `Host(\`${this.coderService.name}.icodeit.xyz\`)`,
              [`traefik.http.services.${this.directoryService.name}.loadbalancer.server.port`]:
                '1337',
              [`traefik.http.routers.${this.directoryService.name}.entrypoints`]: 'playground',
              'traefik.docker.network': 'traefikplaygrounds',
            }
          : {},
        HostConfig: {
          PublishAllPorts: true,
          Binds: [`${this.volume.name}:/home/coder/code`],
        },
      })
      .then(async (container) => {
        this.directoryService.id = container.id;
        if (isProduction) {
          // connect to traefik network in production

          docker
            .getNetwork('traefikplaygrounds')
            .connect({
              Container: container.id,
            })
            .catch(() => null);
        }

        this.directoryService.instance = container;
        await this.network.instance
          .connect({
            Container: container.id,
          })
          .catch(() => {
            throw Error('Error connecting container 2 to network');
          });
        return container;
      })
      .then(async (container) => {
        await container.start({});
      })
      .catch(() => {
        throw Error('Error creating container 2');
      });
  }
  private async updatePorts() {
    if (!this.directoryService.id) {
      return;
    }
    const container = docker.getContainer(this.directoryService.id);
    await container.inspect({}).then(async (result) => {
      const ports = result.NetworkSettings.Ports;
      if (!ports[portMap.explorerPort] || !ports[portMap.webPort]) {
        await this.directoryService.instance.stop({}).then();

        throw Error('Ports not assigned');
      }
      this.directoryService.webPort = ports[portMap.webPort][0].HostPort;
      this.directoryService.explorerPort = ports[portMap.explorerPort][0].HostPort;
    });
  }

  public async startPlayground() {
    try {
      this.allotNames();

      await this.createNetwork();
      await this.createVolume();
      await this.startCodeService();
      await this.startDirectoryService();
      await this.updatePorts();
      this.isRunning = true;
      this.startAutoStop();
      return { success: true };
    } catch (error) {
      logger.error(error);
      return { error: true };
    }
  }
  async backupCode() {
    const exec = await this.directoryService.instance.exec({
      Cmd: ['/home/coder/backup.sh'],
      AttachStdout: true,
      AttachStderr: true,
    });
    return new Promise((resolve, reject) => {
      exec.start({}, (err, stream) => {
        if (stream) {
          stream.setEncoding('utf-8');
          stream.on('data', noop);
          stream.on('close', noop);
          stream.on('end', resolve);
        }
        if (err) {
          reject(err);
        }
      });
    });
  }
  async stopPlayground() {
    try {
      await this.coderService.instance
        .stop({})
        .then(async () => {
          try {
            await this.coderService.instance.remove();
          } catch (error) {
            logger.error(error);
          }
        })
        .catch((err) => {
          if (err) {
            throw Error('Error stopping coderservice');
          }
        });

      await this.backupCode()
        .then()
        .catch((err) => {
          if (err) {
            throw Error('Error backup files');
          }
        });

      await this.directoryService.instance
        .stop({})
        .then(async () => {
          try {
            await this.directoryService.instance.remove();
          } catch (error) {
            logger.error(error);
          }
        })
        .catch((err) => {
          if (err) {
            throw Error('Error stopping directory service');
          }
        });
      const volume = docker.getVolume(this.volume.name);
      await volume.remove({}).catch((err) => {
        if (err) {
          throw Error(`Error removing volume ${err}`);
        }
      });
      await this.network.instance.remove({}).catch((err) => {
        if (err) {
          throw Error('Error removing network');
        }
      });
      this.isRunning = false;
      this.pruneImages();
      return { success: true };
    } catch (error) {
      logger.error(error);
      return { error: true };
    }
  }
  startAutoStop() {
    logger.info(
      `Autostop initiated for ${this.playgroundName}.  Playground will be stopped after 10 minutes`
    );
    setTimeout(async () => {
      await this.stopPlayground();
      logger.info(`Playground ${this.playgroundName} auto stopped`);
      removePlayground(this.playgroundId);
      // 10 minutes
    }, 10 * 60 * 1000);
  }

  get activePorts() {
    return {
      webPort: this.directoryService.webPort,
      explorerPort: this.directoryService.explorerPort,
    };
  }
  get terminalContainerId() {
    return this.coderService.instance?.id;
  }
}
