import { Dispatch } from 'react';
import { BudgetState, Action } from '../../../budget';

export type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};
