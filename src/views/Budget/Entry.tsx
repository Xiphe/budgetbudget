import React, { lazy } from 'react';
import { Startup } from '../../components';
import useBudgetState, { BudgetState } from '../../budget';
import { withShowSettingsProvider, useShowSettings } from '../../lib';
import Settings from '../Settings';

type Props = {
  initialState: BudgetState;
};

const Budget = lazy(() => import('./Budget'));

export default withShowSettingsProvider(({ initialState }: Props) => {
  const showSettings = useShowSettings();
  const { error, state, dispatch } = useBudgetState(initialState);
  if (error) {
    throw error;
  }
  if (state === null) {
    return <Startup />;
  }
  if (showSettings) {
    return <Settings state={state} dispatch={dispatch} />;
  }

  return <Budget state={state} dispatch={dispatch} />;
});
