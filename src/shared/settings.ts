import settings from 'electron-settings';
import fs from 'fs';

export type RecentFile = { name: string; file: string };
export type Settings = ReturnType<typeof getSettings>;

export default function getSettings() {
  function getOpenBudgets(checkExists: boolean = true) {
    return ((settings.get('openBudgets', []) as any) as string[]).filter(
      checkExists ? fs.existsSync : () => true,
    );
  }
  function addOpenBudget(file: string) {
    const open = new Set(getOpenBudgets(false));
    open.add(file);
    settings.set('openBudgets', [...open]);
  }
  function removeOpenBudget(file: string) {
    const open = new Set(getOpenBudgets(false));
    open.delete(file);
    settings.set('openBudgets', [...open]);
  }

  function getRecentFiles(except?: string, checkExists: boolean = true) {
    return ((settings.get('recentFiles', []) as any) as RecentFile[]).filter(
      ({ file }) => {
        if (except && except === file) {
          return false;
        }
        if (checkExists && !fs.existsSync(file)) {
          return false;
        }
        return true;
      },
    );
  }
  function addRecentFile(file: string, name: string) {
    const recent = getRecentFiles(file);

    settings.set('recentFiles', [{ file, name }, ...recent.slice(0, 9)]);
  }
  function watchRecentFiles(cb: (recentFiles: string[]) => void) {
    const obs = settings.watch('recentFiles', cb);

    return obs.dispose;
  }

  return {
    getRecentFiles,
    addRecentFile,
    watchRecentFiles,
    removeOpenBudget,
    getOpenBudgets,
    addOpenBudget,
  };
}
