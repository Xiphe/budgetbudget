import { useState, useEffect } from 'react';
import { ipcRenderer } from './electron';

export const INIT_NEW = Symbol('INIT_NEW');
export default function useInit(): Error | string | null | typeof INIT_NEW {
  const [file, setFile] = useState<string | null | typeof INIT_NEW>(null);
  const [error, setError] = useState<null | Error>(null);
  useEffect(() => {
    let canceled = false;
    ipcRenderer.invoke('INIT').then((res: unknown) => {
      if (canceled) {
        return;
      }
      if (typeof res === 'undefined') {
        setFile(INIT_NEW);
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
