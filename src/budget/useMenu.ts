import { useEffect, useMemo, useState } from 'react';
import {
  createMenu,
  createFileMenu,
  createEditMenu,
  CreateMenuCallbacks,
  ipcRenderer,
  Menu,
  settings,
  useSetShowSettings,
} from '../lib';

export const MENU_ID_SAVE = 'MENU_SAVE';
export const MENU_ID_SAVE_AS = 'MENU_SAVE_AS';

function buildMenu(callbacks: CreateMenuCallbacks) {
  return Menu.buildFromTemplate(
    createMenu(
      [
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
      ],
      callbacks,
    ),
  );
}

export default function useMenu() {
  const setShowSettings = useSetShowSettings();
  const [recentSignal, setRecentSignal] = useState<symbol>(Symbol());
  const [focus, updateFocus] = useState<boolean>(true);
  const menu = useMemo(
    () => buildMenu({ setShowSettings }),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [setShowSettings, recentSignal],
  );
  useEffect(() => {
    const obs = settings.watch('recentFiles', () => {
      setRecentSignal(Symbol());
    });
    const setFocus = () => updateFocus(true);
    const setBlur = () => updateFocus(false);

    ipcRenderer.on('FOCUS', setFocus);
    ipcRenderer.on('BLUR', setBlur);

    return () => {
      obs.dispose();
      ipcRenderer.off('FOCUS', setFocus);
      ipcRenderer.off('BLUR', setBlur);
    };
  }, []);
  useEffect(() => {
    if (focus) {
      Menu.setApplicationMenu(menu);
    }
  }, [focus, menu]);

  return menu;
}
