import { IpcRenderer } from 'electron';
import { useState, useEffect } from 'react';

export default function useInit(): Error | string | null | true {
  const [file, setFile] = useState<string | null | true>(null);
  const [error, setError] = useState<null | Error>(null);
  useEffect(() => {
    let canceled = false;
    var ipcRenderer: IpcRenderer = window.require('electron').ipcRenderer;
    ipcRenderer.invoke('INIT').then((res: unknown) => {
      if (canceled) {
        return;
      }
      if (typeof res === 'undefined') {
        setFile(true);
      } else if (typeof res === 'string') {
        setFile(res);
      } else {
        setError(new Error(`Unexpected init response ${res}`));
      }
    });
    return () => {
      canceled = true;
    };
  }, []);

  return error || file;
}
