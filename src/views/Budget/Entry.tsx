import React, { lazy, useReducer, Suspense } from 'react';
import { BudgetState, budgetReducer } from '../../budget';
import {
  withShowSettingsProvider,
  useShowSettings,
  useMenu,
  useSave,
} from '../../lib';
import { useInitiateAccounts } from '../../moneymoney';
import { Startup } from '../../components';

type Props = {
  initialState: BudgetState;
};

const Settings = lazy(() => import('../Settings'));
const Budget = lazy(() => import('./Budget'));

export default withShowSettingsProvider(({ initialState }: Props) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const menu = useMenu();
  const error = useSave(menu, state);
  const showSettings = useShowSettings();
  useInitiateAccounts(showSettings);

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
