import { Dispatch } from 'react';
import { BudgetState, Action } from '../../../budget';
import { AccountsResource } from '../../../moneymoney/getAccounts';

export type Props = {
  state: BudgetState;
  accountsRes: AccountsResource;
  dispatch: Dispatch<Action>;
};
