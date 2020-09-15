import React, { lazy, useRef } from 'react';
import { BudgetState, useBudgetReducer } from '../../budget';
import {
  withShowSettingsProvider,
  useShowSettings,
  useMenu,
  useSave,
} from '../../lib';
import { Startup } from '../../components';
import { MoneyMoneyResProvider } from '../../moneymoney';

type Props = {
  initialState: BudgetState;
};

const Settings = lazy(() => import('../Settings'));
const Budget = lazy(() => import('./Budget'));

export default withShowSettingsProvider(({ initialState }: Props) => {
  const [state, dispatch] = useBudgetReducer(initialState);
  const refreshRef = useRef<() => void>();
  const menu = useMenu(refreshRef);
  const error = useSave(menu, state);
  const showSettings = useShowSettings();

  if (error) {
    throw error;
  }

  return (
    <MoneyMoneyResProvider
      refreshRef={refreshRef}
      settings={state.settings}
      fallback={<Startup />}
    >
      {showSettings ? (
        <Settings state={state} dispatch={dispatch} />
      ) : (
        <Budget state={state} dispatch={dispatch} />
      )}
    </MoneyMoneyResProvider>
  );
});
