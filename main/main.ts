import {
  app,
  BrowserWindow,
  ipcMain,
  nativeTheme,
  systemPreferences,
} from 'electron';
import createWindowManager from './windowManager';
import createOpenFile from './openFile';
import disableUnused from './disableUnused';
import { createDefaultMenu } from './defaultMenu';
import registerSave from './registerSave';
import moneymoneyHandlers from './moneymoney/handlers';
import getSettings from '../src/shared/settings';

export default function main() {
  /* ref https://github.com/Xiphe/budgetbudget/issues/12 */
  app.allowRendererProcessReuse = true;

  disableUnused(app);

  const settings = getSettings();
  const windowManager = createWindowManager(app, ipcMain, settings);
  windowManager.init();
  const openFile = createOpenFile(ipcMain, windowManager.createWindow);
  const defaultMenu = createDefaultMenu(
    windowManager.createWindow,
    openFile,
    settings,
  );
  registerSave(ipcMain, windowManager);
  moneymoneyHandlers(ipcMain);

  nativeTheme.on('updated', () => {
    windowManager.broadcast('UPDATE_SCHEME');
  });
  systemPreferences.subscribeNotification(
    'AppleColorPreferencesChangedNotification',
    () => windowManager.broadcast('UPDATE_COLOR_PREFERENCES'),
  );
  app.on('window-all-closed', () => {
    defaultMenu.activate();
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      windowManager.createWindow();
    }
  });
}
