import { Dispatch } from 'react';
import { BudgetState, BudgetAction } from '../../../budget';
import { MoneyMoneyRes } from '../../../moneymoney';

export type Props = {
  moneyMoney: MoneyMoneyRes;
  state: BudgetState;
  dispatch: Dispatch<BudgetAction>;
};
