import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import { useRegisterHeaderHeight } from '../../lib';
import styles from './Month.module.scss';
import { Props as CommonProps } from './Types';
import { MonthData, DetailedMonthData } from '../../budget';

type Props = {
  month: MonthData;
  data?: DetailedMonthData;
} & Pick<CommonProps, 'numberFormatter'>;
export default function Overview({
  month: { name, date },
  data,
  numberFormatter,
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
  const budgetClasses = data
    ? classNames(
        data.toBudget !== 0 && styles.bigBudget,
        data.toBudget < 0 && styles.negative,
      )
    : '';

  return (
    <div ref={ref}>
      <h3 className={styles.title}>{name}</h3>
      {data && (
        <>
          <div className={styles.headTable}>
            <div>
              {numberFormatter.format(
                data.available[0] ? data.available[0].amount : 0,
              )}
            </div>
            <div>Available Funds</div>
            <div>{numberFormatter.format(data.overspendPrevMonth)}</div>
            <div>Overspend in {format(subMonths(date, 1), 'MMM')}</div>
            {data.uncategorized.amount !== 0 && (
              <>
                <div>{numberFormatter.format(data.uncategorized.amount)}</div>
                <div>Uncategorized</div>
              </>
            )}
            <div>
              {numberFormatter.format(
                data.total.budgeted === 0 ? 0 : data.total.budgeted * -1,
              )}
            </div>
            <div>Budgeted</div>
            <div className={budgetClasses}>
              {numberFormatter.format(data.toBudget)}
            </div>
            <div className={budgetClasses}>
              {data.toBudget >= 0 ? 'To Budget' : 'Overbudgeted'}
            </div>
          </div>
          <div className={classNames(styles.budgetTotals)}>
            <div>
              Budgeted
              <br />
              <span>{numberFormatter.format(data.total.budgeted)}</span>
            </div>
            <div>
              Spend
              <br />
              <span>{numberFormatter.format(data.total.spend)}</span>
            </div>
            <div>
              Balance
              <br />
              <span>{numberFormatter.format(data.total.balance)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
