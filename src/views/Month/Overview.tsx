import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import { useRegisterHeaderHeight } from '../../lib';
import styles from './Month.module.scss';
import { Props } from './Types';

export default function Overview({
  date,
  numberFormatter,
  budget: { available, overspendPrevMonth, total, toBudget, uncategorized },
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const registerHeaderHeight = useRegisterHeaderHeight();
  useEffect(() => {
    let cleanup: () => void = () => {};
    const registerHeight = () => {
      cleanup();
      cleanup = registerHeaderHeight(
        Math.ceil(ref.current!.getBoundingClientRect().height),
      );
    };
    const observer = new ResizeObserver(registerHeight);
    observer.observe(ref.current!);

    return () => {
      observer.disconnect();
      cleanup();
    };
  }, [registerHeaderHeight]);
  const budgetClasses = classNames(
    toBudget !== 0 && styles.bigBudget,
    toBudget < 0 && styles.negative,
  );

  return (
    <div ref={ref}>
      <h3 className={styles.title}>{format(date, 'MMMM')}</h3>
      <div className={styles.headTable}>
        <div>{numberFormatter.format(available.amount)}</div>
        <div>Available Funds</div>
        <div>{numberFormatter.format(overspendPrevMonth)}</div>
        <div>Overspend in {format(subMonths(date, 1), 'MMM')}</div>
        {uncategorized.amount !== 0 && (
          <>
            <div>{numberFormatter.format(uncategorized.amount)}</div>
            <div>Uncategorized</div>
          </>
        )}
        <div>{numberFormatter.format(total.budgeted)}</div>
        <div>Budgeted</div>
        <div className={budgetClasses}>{numberFormatter.format(toBudget)}</div>
        <div className={budgetClasses}>
          {toBudget >= 0 ? 'To Budget' : 'Overbudgeted'}
        </div>
      </div>
      <div className={classNames(styles.budgetTotals)}>
        <div>
          Budgeted
          <br />
          <span>{numberFormatter.format(total.budgeted)}</span>
        </div>
        <div>
          Spend
          <br />
          <span>{numberFormatter.format(total.spend)}</span>
        </div>
        <div>
          Balance
          <br />
          <span>{numberFormatter.format(total.balance)}</span>
        </div>
      </div>
    </div>
  );
}
