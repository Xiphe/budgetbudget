import { useEffect, useMemo } from 'react';
import {
  createMenu,
  createFileMenu,
  createEditMenu,
  ipcRenderer,
  Menu,
} from '../lib';

export const MENU_ID_SAVE = 'MENU_SAVE';
export const MENU_ID_SAVE_AS = 'MENU_SAVE_AS';

function buildMenu() {
  return Menu.buildFromTemplate(
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
      createEditMenu(),
    ]),
  );
}

export default function useMenu() {
  const menu = useMemo(() => buildMenu(), []);
  useEffect(() => {
    const activate = () => {
      Menu.setApplicationMenu(menu);
    };
    activate();
    ipcRenderer.on('FOCUS', activate);
    return () => {
      ipcRenderer.off('FOCUS', activate);
    };
  }, [menu]);

  return menu;
}
