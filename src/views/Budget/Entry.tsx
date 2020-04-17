import React, { lazy } from 'react';
import { Loading } from '../../components';
import useBudgetState, { BudgetState } from '../../budget';
import { withShowSettingsProvider, useShowSettings } from '../../lib';
import Settings from '../Settings';

type Props = {
  init: string | BudgetState;
};

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
  if (showSettings) {
    return <Settings state={state} dispatch={dispatch} />;
  }

  return <Budget state={state} dispatch={dispatch} />;
});
