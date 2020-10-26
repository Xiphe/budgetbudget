import { Dispatch, useReducer } from 'react';
import { BudgetState, BudgetAction, budgetReducer } from '../budget';
import {
  BaseMoneyMoneyRes,
  MoneyMoneyAction,
  moneyMoneyReducer,
  useMoneyMoney,
  MoneyMoneyRes,
} from '../moneymoney';

export type AppState = {
  budget: BudgetState;
  baseMoneyMoney: BaseMoneyMoneyRes;
};
export type AppAction = BudgetAction | MoneyMoneyAction;

function appReducer(state: AppState, action: AppAction): AppState {
  const newBudget = budgetReducer(state.budget, action);
  const newMM = moneyMoneyReducer(state.baseMoneyMoney, action);

  if (newBudget !== state.budget || newMM !== state.baseMoneyMoney) {
    return {
      budget: newBudget,
      baseMoneyMoney: newMM,
    };
  }

  return state;
}

export default function useAppState(
  initialState: AppState,
): [BudgetState, MoneyMoneyRes, Dispatch<AppAction>] {
  const [{ budget, baseMoneyMoney }, dispatch] = useReducer(
    appReducer,
    initialState,
  );
  const moneyMoney = useMoneyMoney(baseMoneyMoney, dispatch);
  return [budget, moneyMoney, dispatch];
}
