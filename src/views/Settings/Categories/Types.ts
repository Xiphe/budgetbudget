import { Dispatch } from 'react';
import { BudgetState, BudgetAction } from '../../../budget';
import { Category } from '../../../moneymoney';

export type Props = {
  state: BudgetState;
  dispatch: Dispatch<BudgetAction>;
  categories: Category[];
};
