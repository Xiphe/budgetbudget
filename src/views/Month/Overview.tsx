import React, { useEffect } from 'react';
import classNames from 'classnames';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import { useUi } from '../Budget';
import styles from './Month.module.scss';
import { Props } from './Types';

export default function Overview({
  date,
  numberFormatter,
  budget: { available, overspendPrevMonth, total, budgeted },
}: Props) {
  const { registerBigHeader } = useUi();
  useEffect(() => (budgeted !== 0 ? registerBigHeader() : undefined), [
    budgeted,
    registerBigHeader,
  ]);
  const budgetClasses = classNames(
    budgeted !== 0 && styles.bigBudget,
    budgeted < 0 && styles.negative,
  );

  return (
    <>
      <h3 className={styles.title}>{format(date, 'MMMM')}</h3>
      <div className={styles.headTable}>
        <div>{numberFormatter.format(available.amount)}</div>
        <div>Available Funds</div>
        <div>{numberFormatter.format(overspendPrevMonth)}</div>
        <div>Overspend in {format(subMonths(date, 1), 'MMM')}</div>
        <div>{numberFormatter.format(total.budgeted)}</div>
        <div>Budgeted</div>
        <div className={budgetClasses}>{numberFormatter.format(budgeted)}</div>
        <div className={budgetClasses}>
          {budgeted >= 0 ? 'To Budget' : 'Overbudgeted'}
        </div>
      </div>
    </>
  );
}
