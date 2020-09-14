import { dialog } from 'electron';

export default function createOpenFileHandler(
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

  return openFile;
}
