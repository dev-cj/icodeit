import Docker from 'dockerode';
import dockernames from 'docker-names';
import jwt from 'jsonwebtoken';
import config from '../../config/config';
import { ActivePlaygrounds } from '.';
import UserSocket from '../../socket/user/userSocket';

const docker = new Docker();

export const removePlayground = (id) => {
  new UserSocket(null).removeSocketConnections(id);
  delete ActivePlaygrounds[id];
};

const createPlaygroundName = () => {
  const name = 'coder_' + dockernames.getRandomName();
  const playgrounds = Object.values(ActivePlaygrounds);
  const nameExist = playgrounds.some((pl) => pl.playgroundName === name);
  if (nameExist) {
    return createPlaygroundName();
  }
  return name;
};

class DockerHelper {
  pruneImages() {
    docker.pruneImages({});
  }
}
export class PlaygroundBase extends DockerHelper {
  private userId: string;
  playgroundId: string;
  playgroundName: string;

  constructor(playgroundId: string) {
    super();
    this.playgroundId = playgroundId;
    this.playgroundName = createPlaygroundName();
    this.userId = '';
    return this;
  }
  createAccessToken(userId) {
    this.userId = userId;
    const token = jwt.sign({ userId, playgroundId: this.playgroundId }, config.jwt.secret);

    return token;
  }
  verifyAccessToken(accessToken) {
    try {
      const decrypted: any = jwt.verify(accessToken, config.jwt.secret);
      const verified =
        decrypted.playgroundId === this.playgroundId && decrypted.userId === this.userId;

      return verified;
    } catch (error) {
      return false;
    }
  }
  canUserAccess(userId) {
    return this.userId === userId;
  }
}
