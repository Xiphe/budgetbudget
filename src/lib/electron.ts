import { IpcRenderer, Menu as MenuClass } from 'electron';

const electron = window.require('electron');
export const ipcRenderer: IpcRenderer = electron.ipcRenderer;
export const Menu: typeof MenuClass = electron.remote.Menu;
