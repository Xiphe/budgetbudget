import { IpcMain, WebContents, IpcMainEvent, dialog } from 'electron';
import { WindowManager } from './windowManager';

export default function registerSave(
  ipcMain: IpcMain,
  windowManager: WindowManager,
) {
  async function save(file: string, sender: WebContents) {
    windowManager.updateFile(sender, file);
    sender.send('SAVE', file);
  }
  async function saveAs(ev: IpcMainEvent, sender: WebContents) {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: 'my.budget',
      filters: [{ name: 'Budget', extensions: ['budget'] }],
    });
    if (!canceled && filePath) {
      save(filePath, ev.sender);
    } else {
      sender.send('SAVE_CANCELED');
    }
  }
  ipcMain.on('SAVE_AS', saveAs);
  ipcMain.on('SAVE', async (ev, name) => {
    const existing = windowManager.findFile(ev.sender);
    if (existing) {
      save(existing, ev.sender);
    } else {
      saveAs(ev, ev.sender);
    }
  });
}
