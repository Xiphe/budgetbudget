import { useEffect } from 'react';

type CbGuard = <T extends (...args: any[]) => any>(
  cb: T,
) => (...args: Parameters<T>) => void;
type Cleanup = void | (() => void);

export default function useActiveEffect(
  cb: (cbGuard: CbGuard) => Cleanup,
  deps?: any[],
) {
  useEffect(() => {
    let active = true;

    const cleanup = cb((cb2) => {
      return (...args) => {
        if (active) {
          cb2(...args);
        }
      };
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
      active = false;
    };
  }, deps);
}
