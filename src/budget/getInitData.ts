import { ipcRenderer } from 'electron';
import { readFile as rf } from 'fs';
import { promisify } from 'util';
import { createResource, Resource } from '../lib';
import { InitialRes, createInitialRes } from '../moneymoney';
import {
  ViewBudget,
  ViewNew,
  ViewSettings,
  ViewWelcome,
  View,
} from '../shared/types';
import { validateBudgetState, BudgetState } from './Types';
import createInitialState from './createInitialState';

const readFile = promisify(rf);
export type InitDataWithState = {
  view: (ViewBudget | ViewNew | ViewSettings)['type'];
  state: BudgetState;
  res: InitialRes;
};
export type InitData = InitDataWithState | { view: ViewWelcome['type'] };
export type InitRes = Resource<InitData>;

async function getInitData(): Promise<InitData> {
  const init: View = await ipcRenderer.invoke('INIT');

  switch (init.type) {
    case 'welcome':
      return { view: init.type };
    case 'new': {
      const initialState = await createInitialState();
      return {
        view: init.type,
        state: initialState,
        res: createInitialRes(init.type, initialState.settings),
      };
    }
    case 'budget':
    case 'settings': {
      const state = validateBudgetState(
        JSON.parse((await readFile(init.file)).toString()),
      );
      return {
        view: init.type,
        state,
        res: createInitialRes(init.type, state.settings),
      };
    }
  }
}

export const initialInitDataRes = createResource(() => getInitData());
