import React, { lazy } from 'react';
import { Loading } from '../../components';
import useBudgetState, { ACTION_INIT } from '../../budget';
import { INIT_NEW, withShowSettingsProvider, useShowSettings } from '../../lib';
import Settings from '../Settings';

type Props = {
  init: string | typeof INIT_NEW;
};

const NewBudget = lazy(() => import('./NewBudget'));
const Budget = lazy(() => import('./Budget'));

export default withShowSettingsProvider(({ init }: Props) => {
  const showSettings = useShowSettings();
  const { error, state, dispatch } = useBudgetState(init);
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

  if (showSettings) {
    return <Settings state={state} dispatch={dispatch} />;
  }

  return <Budget state={state} dispatch={dispatch} />;
});
