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
  async function saveAs(ev: IpcMainEvent) {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: 'my.budget',
      filters: [{ name: 'Budget', extensions: ['budget'] }],
    });
    if (!canceled && filePath) {
      save(filePath, ev.sender);
    }
  }
  ipcMain.on('SAVE_AS', saveAs);
  ipcMain.on('SAVE', async (ev, name) => {
    const existing = windowManager.getFile(ev.sender);
    if (existing) {
      save(existing, ev.sender);
    } else {
      saveAs(ev);
    }
  });
}
