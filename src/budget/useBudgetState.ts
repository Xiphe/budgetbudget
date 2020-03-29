import { useReducer } from 'react';
import { INIT_NEW } from '../lib';
import useMenu from './useMenu';
import budgetReducer from './budgetReducer';
import useSave from './useSave';
import useInit from './useInit';

export default function useBudget(init: string | typeof INIT_NEW) {
  const [state, dispatch] = useReducer(budgetReducer, null);
  const menu = useMenu();
  const error = useSave(menu, state);
  const loadingError = useInit(init, dispatch);

  return { error: error || loadingError, state, dispatch };
}
