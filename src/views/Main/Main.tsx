import React, { Dispatch, useCallback } from 'react';
import { Action, BudgetState } from '../../budget';
import { useMenu, useSave } from '../../lib';
import { MoneyMoneyRes } from '../../moneymoney';

const Settings = React.lazy(() => import('../Settings'));
const Budget = React.lazy(() => import('../Budget'));

type MainViewProps = {
  view: 'budget' | 'settings';
  state: BudgetState;
  moneyMoney: MoneyMoneyRes;
  dispatch: Dispatch<Action>;
  setView: (view: 'budget' | 'settings') => void;
};
export default function MainView({
  moneyMoney,
  state,
  dispatch,
  view,
  setView,
}: MainViewProps) {
  const openSettings = useCallback(() => {
    setView('settings');
  }, [setView]);
  const openBudget = useCallback(() => {
    setView('budget');
  }, [setView]);
  useSave(useMenu(moneyMoney.refresh, openSettings), state);

  switch (view) {
    case 'budget':
      return (
        <Budget moneyMoney={moneyMoney} state={state} dispatch={dispatch} />
      );
    case 'settings':
      return (
        <Settings
          moneyMoney={moneyMoney}
          state={state}
          dispatch={dispatch}
          onClose={openBudget}
        />
      );
  }
}
