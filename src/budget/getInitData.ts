import { ipcRenderer } from 'electron';
import { readFile } from 'fs';
import { createResource } from '../lib';
import { validateBudgetState, BudgetState } from './Types';

export const INIT_EMPTY = Symbol('INIT_EMPTY');

export default function getInitData() {
  return createResource(() =>
    ipcRenderer.invoke('INIT').then(
      (response: unknown): Promise<BudgetState | typeof INIT_EMPTY> => {
        if (typeof response === 'undefined') {
          return Promise.resolve(INIT_EMPTY);
        } else if (typeof response === 'string') {
          return new Promise<BudgetState>((res, rej) => {
            readFile(response, (err, data) => {
              if (err) {
                rej(err);
                return;
              }
              try {
                res(validateBudgetState(JSON.parse(data.toString())));
              } catch (err) {
                rej(err);
              }
            });
          });
        } else {
          throw new Error(`Unexpected init response ${response}`);
        }
      },
    ),
  );
}
