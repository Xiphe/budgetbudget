import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron';
import createWindowManager from './windowManager';
import createOpenFile from './openFile';
import { createDefaultMenu } from './defaultMenu';
import registerSave from './registerSave';

export default function bootstrap() {
  const windowManager = createWindowManager(ipcMain);
  const openFile = createOpenFile(ipcMain, windowManager.createWindow);
  const defaultMenu = createDefaultMenu(windowManager.createWindow, openFile);
  registerSave(ipcMain, windowManager);

  nativeTheme.on('updated', () => {
    windowManager.broadcast('UPDATE_SCHEME');
  });
  app.on('ready', () => windowManager.createWindow());
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    } else {
      defaultMenu.activate();
    }
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createWindow();
    }
  });
}
