import React, { lazy, Suspense } from 'react';
import { BudgetState, useBudgetReducer } from '../../budget';
import {
  withShowSettingsProvider,
  useShowSettings,
  useMenu,
  useSave,
} from '../../lib';
import { Startup } from '../../components';

type Props = {
  initialState: BudgetState;
};

const Settings = lazy(() => import('../Settings'));
const Budget = lazy(() => import('./Budget'));

export default withShowSettingsProvider(({ initialState }: Props) => {
  const [state, dispatch] = useBudgetReducer(initialState);
  const menu = useMenu();
  const error = useSave(menu, state);
  const showSettings = useShowSettings();

  if (error) {
    throw error;
  }

  return (
    <Suspense fallback={<Startup />}>
      {showSettings ? (
        <Settings state={state} dispatch={dispatch} />
      ) : (
        <Budget state={state} dispatch={dispatch} />
      )}
    </Suspense>
  );
});
