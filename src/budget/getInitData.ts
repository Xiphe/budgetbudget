import { ipcRenderer } from 'electron';
import { readFile as rf } from 'fs';
import { promisify } from 'util';
import { createResource, Resource } from '../lib';
import { View } from '../shared/types';
import { INITIAL_STATE } from './budgetReducer';
import { validateBudgetState, BudgetState } from './Types';

const readFile = promisify(rf);
type InitData = [View['type'], BudgetState];
export type InitRes = Resource<InitData>;

async function getInitData(): Promise<InitData> {
  const init: View = await ipcRenderer.invoke('INIT');

  switch (init.type) {
    case 'welcome':
    case 'new':
      return [init.type, INITIAL_STATE];
    case 'budget':
    case 'settings':
      return [
        init.type,
        validateBudgetState(JSON.parse((await readFile(init.file)).toString())),
      ];
  }
}

export const initialInitData = getInitData();
export const initialInitDataRes = createResource(initialInitData);
export default function createInitDataRes() {
  return createResource(getInitData());
}
