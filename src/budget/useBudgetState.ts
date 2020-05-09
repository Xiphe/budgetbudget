import { useReducer } from 'react';
import useMenu from './useMenu';
import budgetReducer from './budgetReducer';
import useSave from './useSave';
import { BudgetState } from './Types';

export default function useBudget(initialState: BudgetState) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const menu = useMenu();
  const error = useSave(menu, state);

  return { error, state, dispatch };
}
