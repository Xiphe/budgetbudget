import { useState, useEffect, useCallback, useRef } from 'react';
import { writeFile } from 'fs';
import { ipcRenderer, Menu } from 'electron';
import { getSharedSettings } from '../lib';
import { MENU_ID_SAVE, MENU_ID_SAVE_AS } from './useMenu';
import { BudgetState } from './Types';

export default function useSave(menu: Menu, state: BudgetState | null) {
  const [saved, setSaved] = useState<BudgetState | null | Error>(null);
  const stateRef = useRef<BudgetState | null>();
  stateRef.current = state;
  const enable = useCallback(
    (enable: boolean) => {
      let enabled: null | boolean = null;
      if (enable === enabled) {
        return;
      }
      ipcRenderer.send('FILE_EDITED', enable);
      menu.getMenuItemById(MENU_ID_SAVE).enabled = enable;
      menu.getMenuItemById(MENU_ID_SAVE_AS).enabled = enable;
      enabled = enable;
    },
    [menu],
  );
  useEffect(() => {
    let canceled = false;
    const save = (ev: unknown, file: unknown) => {
      const state = stateRef.current;
      if (canceled || !state) {
        return;
      }
      if (typeof file !== 'string') {
        setSaved(new Error(`Expected file path to be string, got ${file}`));
        return;
      }

      getSharedSettings().addRecentFile(file, state.name);
      writeFile(file, JSON.stringify(state), (err) => {
        if (!canceled) {
          setSaved(err || state);
        }
      });
    };
    ipcRenderer.on('SAVE', save);
    return () => {
      canceled = true;
      ipcRenderer.off('SAVE', save);
    };
  }, [stateRef]);
  useEffect(() => {
    if (saved === null && state) {
      setSaved(state);
      return;
    }
    if (saved === state || !state || !state.name || saved instanceof Error) {
      enable(false);
      return;
    }
    enable(true);
  }, [enable, state, saved]);
  return saved instanceof Error ? saved : null;
}
