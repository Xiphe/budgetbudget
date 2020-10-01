import { Dispatch, ReactElement } from 'react';
import { BudgetState, Action } from '../../budget';
import { MoneyMoneyRes } from '../../moneymoney';

export type OK = boolean | 'primary';
export type Step = {
  title: string;
  Comp: (props: {
    nextPage: () => void;
    state: BudgetState;
    dispatch: Dispatch<Action>;
    moneyMoney: MoneyMoneyRes;
    setOk: (ok: OK) => void;
  }) => ReactElement;
  initialOk: (state: BudgetState) => OK;
};
