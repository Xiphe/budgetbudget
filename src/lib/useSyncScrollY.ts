import { MutableRefObject, useCallback } from 'react';

export default function useSyncScrollY(
  syncScrollY?: MutableRefObject<HTMLDivElement | null>,
) {
  return useCallback(
    ({ target: { scrollTop } }) => {
      if (syncScrollY && syncScrollY.current) {
        syncScrollY.current.scrollTop = scrollTop;
      }
    },
    [syncScrollY],
  );
}
