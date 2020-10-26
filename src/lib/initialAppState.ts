import { ipcRenderer } from 'electron';
import { createInitialBaseMoneyMoneyState } from '../moneymoney';
import { createInitialBudgetState, readBudgetStateFromFile } from '../budget';
import {
  ViewBudget,
  ViewNew,
  ViewSettings,
  ViewWelcome,
  View,
} from '../shared/types';
import type { AppState } from './useAppState';
import createResource, { Resource } from './createResource';

export type InitialAppState = AppState & {
  view: (ViewBudget | ViewNew | ViewSettings)['type'];
};
export type InitialAppData = InitialAppState | { view: ViewWelcome['type'] };
export type InitialAppDataRes = Resource<InitialAppData>;

export async function createNewInitialAppState(): Promise<InitialAppData> {
  const budget = await createInitialBudgetState();
  return {
    view: 'new',
    budget,
    baseMoneyMoney: createInitialBaseMoneyMoneyState('new', budget.settings),
  };
}

export const initialAppStateRes = createResource(
  async (): Promise<InitialAppData> => {
    const init: View = await ipcRenderer.invoke('INIT');

    switch (init.type) {
      case 'welcome':
        return { view: init.type };
      case 'new': {
        return createNewInitialAppState();
      }
      case 'budget':
      case 'settings': {
        const budget = await readBudgetStateFromFile(init.file);

        return {
          view: init.type,
          budget,
          baseMoneyMoney: createInitialBaseMoneyMoneyState(
            init.type,
            budget.settings,
          ),
        };
      }
    }
  },
);
