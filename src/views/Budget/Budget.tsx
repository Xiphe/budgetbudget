import React, { Dispatch } from 'react';
import { BudgetState, Action } from '../../budget';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Budget(props: Props) {
  return <h1>Budget</h1>;
}
