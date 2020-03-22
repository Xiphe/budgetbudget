import { IpcRenderer, Menu as MenuClass } from 'electron';
import { useEffect, useMemo } from 'react';
import { createMenu, createFileMenu } from '../lib';

export type Menu = typeof MenuClass;
export const MENU_ID_SAVE = 'MENU_SAVE';
export const MENU_ID_SAVE_AS = 'MENU_SAVE_AS';

const electron = window.require('electron');
const Men: Menu = electron.remote.Menu;
const ipcRenderer: IpcRenderer = electron.ipcRenderer;

function buildMenu() {
  return Men.buildFromTemplate(
    createMenu([
      {
        label: 'File',
        submenu: createFileMenu([
          {
            label: 'Save',
            id: MENU_ID_SAVE,
            enabled: false,
            accelerator: 'CommandOrControl+S',
            async click() {
              ipcRenderer.send('SAVE');
            },
          },
          {
            label: 'Save As...',
            id: MENU_ID_SAVE_AS,
            enabled: false,
            accelerator: 'CommandOrControl+Shift+S',
            async click() {
              ipcRenderer.send('SAVE_AS');
            },
          },
        ]),
      },
    ]),
  );
}

export default function useMenu() {
  const menu = useMemo(() => buildMenu(), []);
  useEffect(() => {
    const activate = () => {
      Men.setApplicationMenu(menu);
    };
    activate();
    ipcRenderer.on('FOCUS', activate);
    return () => {
      ipcRenderer.off('FOCUS', activate);
    };
  }, [menu]);

  return menu;
}
