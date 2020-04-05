import {
  IpcRenderer,
  Menu as MenuClass,
  MenuItem as MenuItemClass,
} from 'electron';

const electron = window.require('electron');
export const ipcRenderer: IpcRenderer = electron.ipcRenderer;
export const Menu: typeof MenuClass = electron.remote.Menu;
export const MenuItem: typeof MenuItemClass = electron.remote.MenuItem;
