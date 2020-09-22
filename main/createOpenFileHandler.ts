import { dialog } from 'electron';
import { View } from '../src/shared/types';

export default function createOpenFileHandler(
  createWindow: (initialView: View) => void,
) {
  const openFile = async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Budget', extensions: ['budget'] }],
    });
    if (canceled) {
      return;
    }
    filePaths.forEach((file) => createWindow({ type: 'budget', file }));
  };

  return openFile;
}
