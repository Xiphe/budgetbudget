import { ipcRenderer } from 'electron';
import { readFile as rf } from 'fs';
import { promisify } from 'util';
import { createResource, Resource } from '../lib';
import { validateBudgetState, BudgetState } from './Types';

const readFile = promisify(rf);
export const INIT_EMPTY = Symbol('INIT_EMPTY');
export type InitRes = Resource<BudgetState | typeof INIT_EMPTY>;

async function getInitData(): Promise<BudgetState | typeof INIT_EMPTY> {
  const response = await ipcRenderer.invoke('INIT');

  if (typeof response === 'undefined') {
    return Promise.resolve(INIT_EMPTY);
  }
  if (typeof response === 'string') {
    return validateBudgetState(
      JSON.parse((await readFile(response)).toString()),
    );
  }
  throw new Error(`Unexpected init response ${response}`);
}

export default function getInitDataRes() {
  return createResource(() => getInitData());
}
