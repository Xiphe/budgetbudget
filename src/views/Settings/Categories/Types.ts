import { Dispatch } from 'react';
import { BudgetState, Action } from '../../../budget';
import { Category } from '../../../moneymoney';

export type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
  categories: Category[];
};
