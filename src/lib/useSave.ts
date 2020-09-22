import { useState, useEffect, useCallback, useRef } from 'react';
import { writeFile } from 'fs';
import isEqual from 'lodash.isequal';
import { ipcRenderer, Menu, remote } from 'electron';
import { getSharedSettings, isError } from '.';
import { MENU_ID_SAVE, MENU_ID_SAVE_AS } from './useMenu';
import { BudgetState } from '../budget/Types';

const UNSAVED = Symbol('UNSAVED');
export function unsaved(state: BudgetState): BudgetState {
  (state as any)[UNSAVED] = true;
  return state;
}
function warnUnsavedChanges(quitAfterSave: React.MutableRefObject<boolean>) {
  return (e: any) => {
    if (quitAfterSave.current) {
      return;
    }
    const answer = remote.dialog.showMessageBoxSync({
      type: 'question',
      message: 'You have unsaved changes, do you really want to quit?',
      buttons: ['Save & Quit', 'Discard & Quit', 'Cancel'],
    });
    if (answer === 1) {
      return;
    }
    if (answer === 0) {
      quitAfterSave.current = true;
      ipcRenderer.send('SAVE');
    }
    e.returnValue = false;
    return false;
  };
}

export default function useSave(menu: Menu, state: BudgetState | null) {
  const [saved, setSaved] = useState<BudgetState | null | Error>(null);
  const stateRef = useRef<BudgetState | null>();
  const enabledRef = useRef<null | boolean>(null);
  const quitAfterSave = useRef<boolean>(false);
  stateRef.current = state;
  const enable = useCallback(
    (enable: boolean) => {
      if (enable === enabledRef.current) {
        return;
      }
      quitAfterSave.current = false;
      window.onbeforeunload = enable ? warnUnsavedChanges(quitAfterSave) : null;
      ipcRenderer.send('FILE_EDITED', enable);
      menu.getMenuItemById(MENU_ID_SAVE).enabled = enable;
      enabledRef.current = enable;
    },
    [menu],
  );
  useEffect(() => {
    menu.getMenuItemById(MENU_ID_SAVE_AS).enabled = Boolean(
      state && !isError(state) && state.name,
    );
  }, [menu, state]);
  useEffect(() => {
    const saveCanceled = () => {
      quitAfterSave.current = false;
    };
    ipcRenderer.on('SAVE_CANCELED', saveCanceled);
    return () => {
      ipcRenderer.off('SAVE_CANCELED', saveCanceled);
    };
  }, []);
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

      writeFile(file, JSON.stringify(state), (err) => {
        if (err) {
          setSaved(err);
          return;
        }
        getSharedSettings().addRecentFile(file, state.name);
        if (quitAfterSave.current) {
          ipcRenderer.send('QUIT');
          return;
        }
        if (!canceled) {
          setSaved(state);
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
      if ((state as any)[UNSAVED]) {
        delete (state as any)[UNSAVED];
      } else {
        setSaved(state);
        return;
      }
    }
    if (
      !state ||
      isError(saved) ||
      !state.name ||
      state === saved ||
      isEqual(state, saved)
    ) {
      enable(false);
      return;
    }
    enable(true);
  }, [enable, state, saved]);
  if (isError(saved)) {
    throw saved;
  }
}
