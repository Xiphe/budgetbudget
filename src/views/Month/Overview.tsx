import React, { useEffect } from 'react';
import classNames from 'classnames';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import { BudgetListEntry } from '../../budget/useBudgets';
import { NumberFormatter } from '../../lib';
import { useUi } from '../Budget';
import styles from './Month.module.scss';

export type Props = {
  date: Date;
  numberFormatter: NumberFormatter;
  budget?: BudgetListEntry;
};

const EMPTY_BUDGET: Pick<BudgetListEntry, 'total' | 'available'> = {
  total: {
    budgeted: 0,
    spend: 0,
    balance: 0,
  },
  available: {
    amount: 0,
    transactions: [],
  },
};
export default function Overview({ date, numberFormatter, budget }: Props) {
  const { registerBigHeader } = useUi();
  const { available, total } = budget || EMPTY_BUDGET;
  const toBudget = available.amount - total.budgeted;

  useEffect(() => (toBudget !== 0 ? registerBigHeader() : undefined), [
    toBudget,
    registerBigHeader,
  ]);
  const budgetClasses = classNames(
    toBudget !== 0 && styles.bigBudget,
    toBudget < 0 && styles.negative,
  );

  return (
    <>
      <h3 className={styles.title}>{format(date, 'MMMM')}</h3>
      <div className={styles.headTable}>
        <div>{numberFormatter.format(available.amount)}</div>
        <div>Available Funds</div>
        <div>TODO</div>
        <div>Overspend in {format(subMonths(date, 1), 'MMM')}</div>
        <div>{numberFormatter.format(total.budgeted)}</div>
        <div>Budgeted</div>
        <div className={budgetClasses}>{numberFormatter.format(toBudget)}</div>
        <div className={budgetClasses}>
          {toBudget >= 0 ? 'To Budget' : 'Overbudgeted'}
        </div>
      </div>
    </>
  );
}
