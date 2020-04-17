import { useEffect, useState, Dispatch } from 'react';
import { readFile } from '../lib';
import { ACTION_INIT, Action } from './budgetReducer';
import { validateBudgetState } from './Types';
import { BudgetState } from './Types';

export default function useInit(
  init: string | BudgetState,
  dispatch: Dispatch<Action>,
) {
  const [loadingError, setLoadingError] = useState<null | Error>(null);
  useEffect(() => {
    let canceled = false;
    if (typeof init !== 'string') {
      dispatch({
        type: ACTION_INIT,
        payload: init,
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
