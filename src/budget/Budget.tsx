import React, { useReducer, lazy } from 'react';
import { INIT_NEW } from '../lib';
import { Loading } from '../components';
import useMenu from './useMenu';
import budgetReducer, { ACTION_INIT } from './budgetReducer';
import useSave from './useSave';
import useInit from './useInit';

const Months = lazy(() => import('./Months'));
const NewBudget = lazy(() => import('./NewBudget'));

type Props = {
  init: string | typeof INIT_NEW;
};

export default function Budget({ init }: Props) {
  const [state, dispatch] = useReducer(budgetReducer, null);
  const menu = useMenu();
  const error = useSave(menu, state);
  const loadingError = useInit(init, dispatch);

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

  return (
    <>
      <h1>{state.name}</h1>
      <Months state={state} dispatch={dispatch} />
    </>
  );
}
