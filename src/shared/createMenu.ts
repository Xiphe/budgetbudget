import { MenuItemConstructorOptions } from 'electron';
import { basename } from 'path';
import { RecentFile } from './settings';

type MenuConfig = MenuItemConstructorOptions;
export type CreateMenuCallbacks = {
  refresh?: () => void;
  welcome: () => void;
  setShowSettings?: (show: boolean) => void;
};

function isMenuConfig(
  entry: MenuConfig | boolean | undefined,
): entry is MenuConfig {
  return Boolean(entry);
}

export function createMenu(
  appName: string,
  entries: MenuConfig[] = [],
  { setShowSettings, welcome }: CreateMenuCallbacks,
): MenuConfig[] {
  const submenu: (MenuConfig | false | undefined)[] = [
    { role: 'about' },
    { label: 'Open Welcome', click: welcome },
    { type: 'separator' },
    setShowSettings && {
      label: 'Settings',
      accelerator: 'CommandOrControl+,',
      click: () => setShowSettings(true),
    },
    { type: 'separator' },
    { role: 'services' },
    { type: 'separator' },
    { role: 'hide' },
    { role: 'hideOthers' },
    { role: 'unhide' },
    { type: 'separator' },
    { role: 'quit' },
  ];

  return [
    {
      label: appName,
      submenu: submenu.filter(isMenuConfig),
    },
    ...entries,
  ];
}

type FileMenuConfig = {
  entries?: MenuConfig[];
  openRecent?: MenuConfig | false;
  fileNew: () => void;
  fileOpen: () => void;
};
export function createFileMenu({
  entries = [],
  openRecent = false,
  fileNew,
  fileOpen,
}: FileMenuConfig): MenuConfig {
  const config: (MenuConfig | false)[] = [
    {
      label: 'New Budget',
      accelerator: 'CommandOrControl+N',
      click: fileNew,
    },
    { type: 'separator' },
    {
      label: 'Open...',
      accelerator: 'CommandOrControl+O',
      click: fileOpen,
    },
    openRecent,
    entries.length ? { type: 'separator' } : false,
    ...entries,
    { type: 'separator' },
    process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
  ];

  return {
    label: 'File',
    submenu: config.filter(isMenuConfig),
  };
}

export function createOpenRecent(
  recentFiles: RecentFile[],
  openExisting: (file: string) => void,
): MenuConfig {
  return {
    label: 'Open Recent',
    id: 'open-recent',
    submenu: recentFiles.map(({ name, file }) => ({
      label: `${name} - ${basename(file)}`,
      click: openExisting.bind(null, file),
    })),
  };
}

export function createEditMenu(): MenuConfig {
  return {
    label: 'Edit',
    submenu: [
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
      },
    ],
  };
}
