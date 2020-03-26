import { Menu } from 'electron';

export function createDefaultMenu(
  createWindow: (file?: string) => void,
  openFile: () => void,
) {
  const defaultMenu = Menu.buildFromTemplate([
    { role: 'appMenu' },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Budget',
          accelerator: 'CommandOrControl+N',
          click() {
            createWindow();
          },
        },
        { type: 'separator' },
        {
          label: 'Open...',
          accelerator: 'CommandOrControl+O',
          click: openFile,
        },
        { type: 'separator' },
        process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
      ],
    },
  ]);

  return {
    activate() {
      Menu.setApplicationMenu(defaultMenu);
    },
  };
}
