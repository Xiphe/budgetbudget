import { useEffect, useMemo, useState } from 'react';
import { ipcRenderer, remote, MenuItemConstructorOptions } from 'electron';
import { useSetShowSettings } from './ShowSettingsContext';
import {
  createMenu,
  createFileMenu,
  createEditMenu,
  createOpenRecent,
  CreateMenuCallbacks,
} from '../shared/createMenu';
import { useRefresh } from '../moneymoney';
import { useRecentFiles } from './useRecentFiles';
import { RecentFile } from '../shared/settings';

export const MENU_ID_SAVE = 'MENU_SAVE';
export const MENU_ID_SAVE_AS = 'MENU_SAVE_AS';

function buildMenu(callbacks: CreateMenuCallbacks, recentFiles: RecentFile[]) {
  const refresh: MenuItemConstructorOptions[] = callbacks.refresh
    ? [
        { type: 'separator' },
        {
          label: 'Refresh MoneyMoney Data',
          enabled: true,
          accelerator: 'CommandOrControl+R',
          click: callbacks.refresh,
        },
      ]
    : [];
  const fileMenuEntries: MenuItemConstructorOptions[] = [
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
  ];

  return remote.Menu.buildFromTemplate(
    createMenu(
      remote.app.name,
      [
        createFileMenu({
          fileOpen: () => ipcRenderer.invoke('MENU_FILE_OPEN'),
          fileNew: () => ipcRenderer.invoke('MENU_FILE_NEW'),
          openRecent: createOpenRecent(recentFiles, (file) =>
            ipcRenderer.invoke('MENU_FILE_OPEN_EXISTING', file),
          ),
          entries: fileMenuEntries.concat(refresh),
        }),
        createEditMenu(),
      ],
      callbacks,
    ),
  );
}

export default function useMenu() {
  const setShowSettings = useSetShowSettings();
  const refresh = useRefresh();
  const recentFiles = useRecentFiles();
  const [focus, updateFocus] = useState<boolean>(true);
  const menu = useMemo(
    () =>
      buildMenu(
        {
          setShowSettings,
          refresh,
          welcome: () => ipcRenderer.invoke('MENU_FILE_WELCOME'),
        },
        recentFiles,
      ),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [setShowSettings, refresh, recentFiles],
  );
  useEffect(() => {
    const setFocus = () => updateFocus(true);
    const setBlur = () => updateFocus(false);

    ipcRenderer.on('FOCUS', setFocus);
    ipcRenderer.on('BLUR', setBlur);

    return () => {
      ipcRenderer.off('FOCUS', setFocus);
      ipcRenderer.off('BLUR', setBlur);
    };
  }, []);
  useEffect(() => {
    if (focus) {
      remote.Menu.setApplicationMenu(menu);
    }
  }, [focus, menu]);

  return menu;
}
