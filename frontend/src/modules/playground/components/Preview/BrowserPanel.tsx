import React, { useEffect, useState } from 'react';

type Props = {
  webUrl?: string;
};

const BrowserPanel = (props: Props) => {
  const [src, setSrc] = useState('');
  const reload = () => {
    setSrc('');
    try {
      fetch(`${props.webUrl}/`)
        .then((response) => {
          if (response.status >= 200) {
            setSrc(`${props.webUrl}/`);
          }
        })
        .catch((error) => {});
    } catch (s) {}
  };

  useEffect(() => {
    if (!props.webUrl) {
      return;
    }
    let e: any;
    return (
      (async function t() {
        try {
          fetch(`${props.webUrl}/`)
            .then((response) => {
              if (response.status >= 200) {
                setSrc(`${props.webUrl}/`);
              }
            })
            .catch((error) => {
              e = setTimeout(() => {
                t();
              }, 1000);
            });
        } catch (s) {}
      })(),
      () => {
        e && clearTimeout(e), (e = null);
      }
    );
  }, [props.webUrl]);

  if (!props.webUrl) {
    return null;
  }

  return (
    <div className='w-full h-full flex flex-col bg-purple-50'>
      <div className='border-b border-gray-700 bg-gray-900 shadow text-sm text-white p-1 w-full flex justify-between items-center'>
        <div>{props.webUrl}</div>
        <button onClick={() => reload()}>Reload</button>
      </div>
      {src && <iframe className='w-full h-full' src={src}></iframe>}
    </div>
  );
};

export default BrowserPanel;
