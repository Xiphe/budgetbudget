import { Dispatch, ReactElement } from 'react';
import { BudgetState, BudgetAction } from '../../budget';
import { NumberFormatter } from '../../lib';
import { MoneyMoneyRes } from '../../moneymoney';

export type StepCompProps = {
  nextPage: () => void;
  state: BudgetState;
  dispatch: Dispatch<BudgetAction>;
  moneyMoney: MoneyMoneyRes;
  setOk: (ok: OK) => void;
  numberFormatter: NumberFormatter;
};
export type OK = boolean | 'primary';
export type Step = {
  title: string;
  Comp: (props: StepCompProps) => ReactElement;
  initialOk: (state: BudgetState) => OK;
};
