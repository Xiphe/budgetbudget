import {
  app,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  systemPreferences,
} from 'electron';
import createWindowManager from './windowManager';
import createOpenFile from './openFile';
import { createDefaultMenu } from './defaultMenu';
import registerSave from './registerSave';
import moneymoneyHandlers from './moneymoney/handlers';

export default function bootstrap() {
  const windowManager = createWindowManager(ipcMain);
  const openFile = createOpenFile(ipcMain, windowManager.createWindow);
  const defaultMenu = createDefaultMenu(windowManager.createWindow, openFile);
  registerSave(ipcMain, windowManager);
  moneymoneyHandlers(ipcMain);

  nativeTheme.on('updated', () => {
    windowManager.broadcast('UPDATE_SCHEME');
  });
  systemPreferences.subscribeNotification(
    'AppleColorPreferencesChangedNotification',
    () => windowManager.broadcast('UPDATE_COLOR_PREFERENCES'),
  );
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
