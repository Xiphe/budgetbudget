import { Dispatch, ReactElement } from 'react';
import { BudgetState, BudgetAction } from '../../budget';
import { MoneyMoneyRes } from '../../moneymoney';

export type StepCompProps = {
  nextPage: () => void;
  prevPage: () => void;
  state: BudgetState;
  dispatch: Dispatch<BudgetAction>;
  moneyMoney: MoneyMoneyRes;
  setOk: (ok: OK) => void;
};
export type OK = boolean | 'primary';
export type Step = {
  title: string;
  Comp: (props: StepCompProps) => ReactElement;
  initialOk: (state: BudgetState) => OK;
};
