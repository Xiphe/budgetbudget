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
  budget: { available, total },
}: Props) {
  const { registerBigHeader } = useUi();
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
