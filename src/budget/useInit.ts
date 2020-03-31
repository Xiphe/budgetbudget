import { readFile as rft } from 'fs';
import { useEffect, useState, Dispatch } from 'react';
import { INIT_NEW } from '../lib';
import { ACTION_INIT, Action } from './budgetReducer';
import { validateBudgetState, VERSION } from './Types';
const readFile: typeof rft = window.require('fs').readFile;

export default function useInit(
  init: string | typeof INIT_NEW,
  dispatch: Dispatch<Action>,
) {
  const [loadingError, setLoadingError] = useState<null | Error>(null);
  useEffect(() => {
    let canceled = false;
    if (init === INIT_NEW) {
      dispatch({
        type: ACTION_INIT,
        payload: {
          version: VERSION,
          settings: {
            accounts: [],
            incomeCategories: [],
            fractionDigits: 2,
            numberLocale: 'de-DE',
          },
          budgets: {},
        },
      });
    } else {
      readFile(init, (err, data) => {
        if (canceled) {
          return;
        }
        if (err) {
          setLoadingError(err);
          return;
        }
        try {
          dispatch({
            type: ACTION_INIT,
            payload: validateBudgetState(JSON.parse(data.toString())),
          });
        } catch (err) {
          setLoadingError(err);
        }
      });
    }
    return () => {
      canceled = true;
    };
  }, [init, dispatch]);

  return loadingError;
}