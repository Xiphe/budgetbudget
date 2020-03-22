import { readFile as rft } from 'fs';
import React, { useEffect, useReducer, lazy, useState } from 'react';
import { INIT_NEW } from '../lib';
import { Loading } from '../components';
import useMenu from './useMenu';
import budgetReducer, { ACTION_INIT } from './budgetReducer';
import useSave from './useSave';
import { isBudgetState } from './Types';

const NewBudget = lazy(() => import('./NewBudget'));
const readFile: typeof rft = window.require('fs').readFile;

type Props = {
  init: string | typeof INIT_NEW;
};

export default function Budget({ init }: Props) {
  const [state, dispatch] = useReducer(budgetReducer, null);
  const menu = useMenu();
  const error = useSave(menu, state);
  const [loadingError, setLoadingError] = useState<null | Error>(null);
  useEffect(() => {
    let canceled = false;
    if (init === INIT_NEW) {
      dispatch({ type: ACTION_INIT, payload: { settings: {} } });
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
          const budget = JSON.parse(data.toString());
          if (!isBudgetState(budget)) {
            throw new Error(`Malformed budget: ${init}`);
          }
          dispatch({ type: ACTION_INIT, payload: budget });
        } catch (err) {
          setLoadingError(err);
        }
      });
    }
    return () => {
      canceled = true;
    };
  }, [init]);

  if (loadingError) {
    return <p>Error: {loadingError.message}</p>;
  }
  if (error) {
    return <p>Error: {error.message}</p>;
  }
  if (state === null) {
    return <Loading />;
  }

  if (!state.name) {
    return (
      <NewBudget
        onCreate={(budget) => dispatch({ type: ACTION_INIT, payload: budget })}
      />
    );
  }

  return <h1>{state.name}</h1>;
}
