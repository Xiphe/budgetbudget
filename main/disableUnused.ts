import { App } from 'electron';

const allowedElectronModules = new Set([
  'nativeTheme',
  'systemPreferences',
  'Menu',
  'app',
  'MenuItem',
]);
export default function disableUnused(app: App) {
  app.on('web-contents-created', (_, contents) => {
    contents.on('will-navigate', (event) => {
      event.preventDefault();
    });
    contents.on('new-window', (event) => {
      event.preventDefault();
    });
  });
  app.on('remote-require', (event) => {
    event.preventDefault();
  });
  app.on('remote-get-builtin', (event, _, moduleName) => {
    if (!allowedElectronModules.has(moduleName)) {
      event.preventDefault();
    }
  });
  app.on('remote-get-global', (event) => {
    event.preventDefault();
  });
  app.on('remote-get-current-window', (event, webContents) => {
    event.preventDefault();
  });
  app.on('remote-get-current-web-contents', (event, webContents) => {
    event.preventDefault();
  });
}
