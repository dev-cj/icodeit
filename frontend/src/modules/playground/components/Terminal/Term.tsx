import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import 'xterm/css/xterm.css';
import { useSocketContext } from '../../utils/SocketContext/SocketContext';

type Props = {
  id?: string | null;
};

const TerminalC = ({ id = null }: Props) => {
  const { socket } = useSocketContext();
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    //   creating the terminal
    if (!container.current || !id) {
      return;
    }

    const terminal = new Terminal({
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    const unicode11Addon = new Unicode11Addon();

    // activate the new version
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(unicode11Addon);

    terminal.unicode.activeVersion = '11';
    terminal.open(container.current);

    terminal.onData((data: any) => {
      socket.emit(`terminal${id}cmd`, data);
    });
    terminal.onResize((event: any) => {
      socket.emit('resize', { cols: event.cols, rows: event.rows + 1 });
    });

    fitAddon.fit();
    socket.emit('exec', `${String(id)}`); //start terminal

    socket.on('terminal1created', (arg) => {
      if (arg === 'true') {
        terminal.writeln(
          'Reconnected  **This line is not an output of the attached terminal**'
        );
      }
    });
    socket.on(`terminal${id}show`, (data) => {
      terminal.write(data);
    });
    const xterm_resize_ob = new ResizeObserver(function (entries) {
      try {
        if (!fitAddon) {
          return;
        }
        fitAddon.fit();
        const dimensions = fitAddon.proposeDimensions();
        if (dimensions && socket.connected) {
          socket.emit('resize', {
            cols: dimensions.cols,
            rows: dimensions.rows + 1,
          });
        }
      } catch (err) {
        console.log(err);
      }
    });
    xterm_resize_ob.observe(container.current);
    return () => {
      terminal.dispose();

      socket.close();
    };
  }, [container]);

  if (!id) {
    return null;
  }

  return <div className={'h-full pb-4'} ref={container} />;
};

export default TerminalC;
