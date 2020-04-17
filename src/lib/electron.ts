import {
  IpcRenderer,
  Menu as MenuClass,
  MenuItem as MenuItemClass,
  Shell,
  App,
} from 'electron';

const electron = window.require('electron');
export const ipcRenderer: IpcRenderer = electron.ipcRenderer;
export const Menu: typeof MenuClass = electron.remote.Menu;
export const appName: string = electron.remote.app.name;
export const getLocale: App['getLocale'] = electron.remote.app.getLocale;
export const MenuItem: typeof MenuItemClass = electron.remote.MenuItem;
export const shell: Shell = electron.shell;
