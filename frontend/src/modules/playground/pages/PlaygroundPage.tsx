'use client';
import React, { useState, useEffect } from 'react';
import { Allotment, LayoutPriority } from 'allotment';
import 'allotment/dist/style.css';
import { ActivityBar } from '../components/ActivityBar';
import Sidebar from '../components/Sidebar';
import StatusBar from '../components/StatusBar';
import Terminal from '../components/Terminal/Terminal';
import Editor from '../components/Editor';
import BrowserPanel from '../components/Preview/BrowserPanel';
import { SocketContext } from '../utils/SocketContext/SocketContext';
import { Socket, connect } from 'socket.io-client';
import { SourceCodeContextProvider } from '../utils/SourceCodeContext/SourceCodeContext';
import { getPlayground, stopPlayground } from '@/modules/playgrounds/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/AppLogo';
import Button from '@/common/Button';
import {
  DEV_BACKEND_URL,
  PROD_BACKEND_URL,
  isDevelopment,
} from '@/shared/config';

type Props = {
  playgroundId: string;
};

export const PanelTypes = {
  terminal: 'terminal' as const,
  browser: 'browser' as const,
  editor: 'editor' as const,
  all: 'all' as const,
};

export type Panels = keyof typeof PanelTypes;

const PlaygroundPage = (props: Props) => {
  const router = useRouter();

  const playgroundId = props.playgroundId;
  const [showEditor, setShowEditor] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [accessToken, setAccessToken] = useState('');
  const [webUrl, setWebUrl] = useState('');
  const [showTerminal, setShowTerminal] = useState(true);
  const [showBrowser, setShowBrowser] = useState(true);
  const [activity, setActivity] = useState(0);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  const [sideBarVisible, setSideBarVisible] = useState(true);

  const onUpdateView = (type: Panels) => {
    const panelConfig = {
      [PanelTypes.all]: () => {
        setShowEditor(true);
        setShowTerminal(true);
        setShowBrowser(true);
      },
      [PanelTypes.editor]: () => {
        setShowEditor(true);
        setShowTerminal(false);
        setShowBrowser(false);
      },
      [PanelTypes.browser]: () => {
        setShowEditor(false);
        setShowTerminal(false);
        setShowBrowser(true);
      },
      [PanelTypes.terminal]: () => {
        setShowEditor(false);
        setShowTerminal(true);
        setShowBrowser(false);
      },
    };
    const updateFunction = panelConfig[type];
    if (updateFunction) {
      updateFunction();
    }
  };

  const onStopPlayground = async () => {
    await stopPlayground(playgroundId);

    toast.success('Playground stopped.');

    router.push('/playgrounds');
  };

  useEffect(() => {
    if (accessToken) {
      const socket = connect(
        isDevelopment ? DEV_BACKEND_URL : PROD_BACKEND_URL,
        {
          auth: {
            token: accessToken,
          },
        }
      );
      socket.on('connect', () => {});
      socket.on('playgroundAvailable', (available) => {
        if (available) {
          setSocket(socket);
          setShowLoading(false);
        }
      });
    } else {
      setSocket(undefined);
    }
  }, [accessToken]);

  const init = async () => {
    const { success, data, message } = await getPlayground(playgroundId);

    if (success && data) {
      setAccessToken(data.accessToken);
      setWebUrl(data.webUrl);
    } else {
      toast.error(message || 'Error fetching playground.');
      router.push('/playgrounds');
    }
  };

  useEffect(() => {
    if (playgroundId) {
      init();
    }
  }, [playgroundId]);

  if (!socket || showLoading) {
    return (
      <div className='w-full items-center justify-center min-h-screen text-lg text-center flex flex-col h-full'>
        <div>Connecting to the playground please wait</div>
        <div className='animate-spin'></div>
      </div>
    );
  }

  return (
    <SourceCodeContextProvider socket={socket}>
      <SocketContext.Provider
        value={{
          socket: socket,
        }}
      >
        <div className='flex flex-col w-full h-screen max-h-screen bg-[#18181b]'>
          <div className='flex justify-between items-center px-4'>
            <AppLogo className='h-12' />
            <div>
              <Button
                onClick={onStopPlayground}
                className='h-8 bg-gray-700 text-xs'
              >
                Stop Playground
              </Button>
            </div>
          </div>

          <Allotment
            proportionalLayout={false}
            onVisibleChange={(index, visible) => {
              if (index === 1) {
                setSideBarVisible(visible);
              }
            }}
            defaultSizes={[48, 300]}
          >
            <Allotment.Pane
              key='activityBar'
              minSize={48}
              maxSize={48}
              visible={true}
            >
              <ActivityBar
                checked={activity}
                sideBarVisible={sideBarVisible}
                items={[
                  'files',
                  'search',
                  'source-control',
                  'debug-alt',
                  'extensions',
                ]}
                toggleSidebar={setSideBarVisible}
                setActiveActivity={(index) => {
                  setActivity(index);
                }}
              />
            </Allotment.Pane>

            <Allotment.Pane
              key='sidebar'
              minSize={
                showEditor || showTerminal || showBrowser ? 220 : undefined
              }
              preferredSize={300}
              visible={sideBarVisible}
              maxSize={400}
              snap={sideBarVisible}
              priority={LayoutPriority.Low}
            >
              <Sidebar />
            </Allotment.Pane>
            <Allotment.Pane
              key='content'
              minSize={showEditor || showTerminal ? 300 : undefined}
              visible={showEditor || showTerminal}
            >
              <Allotment vertical>
                <Allotment.Pane key='editor' minSize={300} visible={showEditor}>
                  <Editor />
                </Allotment.Pane>
                <Allotment.Pane
                  key='terminal'
                  preferredSize='20%'
                  minSize={36}
                  visible={showTerminal}
                >
                  <Terminal />
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>
            <Allotment.Pane
              key='BrowserPanel'
              minSize={300}
              visible={showBrowser}
              priority={LayoutPriority.Low}
            >
              <BrowserPanel webUrl={webUrl} />
            </Allotment.Pane>
          </Allotment>

          <StatusBar
            showEditor={showEditor}
            showTerminal={showTerminal}
            showBrowser={showBrowser}
            onUpdateView={onUpdateView}
          />
        </div>
      </SocketContext.Provider>
    </SourceCodeContextProvider>
  );
};

export default PlaygroundPage;
