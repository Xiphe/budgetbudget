import { useReducer } from 'react';
import useMenu from './useMenu';
import budgetReducer from './budgetReducer';
import useSave from './useSave';
import useInit from './useInit';
import { BudgetState } from './Types';

export default function useBudget(init: string | BudgetState) {
  const [state, dispatch] = useReducer(budgetReducer, null);
  const menu = useMenu();
  const error = useSave(menu, state);
  const loadingError = useInit(init, dispatch);

  return { error: error || loadingError, state, dispatch };
}
