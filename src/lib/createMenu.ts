import { MenuItemConstructorOptions } from 'electron';
import { ipcRenderer, appName } from './electron';

type MenuConfig = MenuItemConstructorOptions;
export type CreateMenuCallbacks = {
  setShowSettings?: (show: boolean) => void;
};

function isMenuConfig(
  entry: MenuConfig | boolean | undefined,
): entry is MenuConfig {
  return Boolean(entry);
}

export function createMenu(
  entries: MenuConfig[] = [],
  { setShowSettings }: CreateMenuCallbacks = {},
): MenuConfig[] {
  const submenu: (MenuConfig | false | undefined)[] = [
    { role: 'about' },
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

export function createFileMenu(entries: MenuConfig[] = []): MenuConfig[] {
  const config: (MenuConfig | false)[] = [
    {
      label: 'New Budget',
      accelerator: 'CommandOrControl+N',
      click() {
        ipcRenderer.invoke('MENU_FILE_NEW');
      },
    },
    { type: 'separator' },
    {
      label: 'Open...',
      accelerator: 'CommandOrControl+O',
      async click() {
        ipcRenderer.invoke('MENU_FILE_OPEN');
      },
    },
    entries.length ? { type: 'separator' } : false,
    ...entries,
    { type: 'separator' },
    process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
  ];

  return config.filter(isMenuConfig);
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
