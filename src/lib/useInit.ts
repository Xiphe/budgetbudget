import { useState, useEffect } from 'react';
import { ipcRenderer } from './electron';
import { BudgetState } from '../budget';

export const INIT_EMPTY = Symbol('INIT_EMPTY');
export default function useInit(): [
  Error | string | null | typeof INIT_EMPTY | BudgetState,
  (state: BudgetState) => void,
] {
  const [file, setFile] = useState<
    string | null | typeof INIT_EMPTY | BudgetState
  >(null);
  const [error, setError] = useState<null | Error>(null);
  useEffect(() => {
    let canceled = false;
    ipcRenderer.invoke('INIT').then((res: unknown) => {
      if (canceled) {
        return;
      }
      if (typeof res === 'undefined') {
        setFile(INIT_EMPTY);
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

  return [error || file, setFile];
}
