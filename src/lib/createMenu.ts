import { MenuItemConstructorOptions } from 'electron';
import { ipcRenderer } from './electron';

type MenuConfig = MenuItemConstructorOptions;

export function createMenu(entries: MenuConfig[] = []): MenuConfig[] {
  return [{ role: 'appMenu' }, ...entries];
}

function isMenuConfig(entry: MenuConfig | boolean): entry is MenuConfig {
  return Boolean(entry);
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
