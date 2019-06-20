import { app } from 'electron';
import WindowManager from './WindowManager';
import createServer from './moneyMoney';

declare var MAIN_WINDOW_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const manager = new WindowManager(MAIN_WINDOW_WEBPACK_ENTRY);
createServer();

app.on('ready', manager.new);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', manager.activate);
