import { useEffect, useState } from 'react';
import getSharedSettings, { RecentFile } from './getSharedSettings';

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(
    getSharedSettings().getRecentFiles(),
  );
  useEffect(
    () =>
      getSharedSettings().watchRecentFiles(() => {
        setRecentFiles(getSharedSettings().getRecentFiles());
      }),
    [],
  );

  return recentFiles;
}
