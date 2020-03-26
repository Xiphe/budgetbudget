import { dialog, IpcMain } from 'electron';

export default function createOpenFile(
  ipcMain: IpcMain,
  createWindow: (file?: string) => void,
) {
  const openFile = async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Budget', extensions: ['budget'] }],
    });
    if (canceled) {
      return;
    }
    filePaths.forEach(createWindow);
  };

  ipcMain.handle('MENU_FILE_OPEN', openFile);
  return openFile;
}
