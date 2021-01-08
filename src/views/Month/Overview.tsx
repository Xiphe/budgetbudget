import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import classNames from 'classnames';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import styles from './Month.module.scss';
import { Props as CommonProps } from './Types';
import { MonthData, DetailedMonthData } from '../../budget';

function ListItem({
  amount,
  title,
  className,
}: {
  amount: string;
  title: string;
  className?: string;
}) {
  return (
    <li aria-label={`${amount} ${title}`} className={className}>
      <span>{amount}</span>
      <span>{title}</span>
    </li>
  );
}

type Props = {
  month: MonthData;
  data?: DetailedMonthData;
} & Pick<CommonProps, 'numberFormatter'>;
export default function Overview({
  month: { name, date },
  data,
  numberFormatter,
}: Props) {
  const budgetClasses = data
    ? classNames(
        data.toBudget !== 0 && styles.bigBudget,
        data.toBudget < 0 && styles.negative,
      )
    : '';
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const i = setTimeout(() => setVisible(Boolean(data)), 50);
    return () => clearTimeout(i);
  }, [data]);

  return (
    <div>
      <h3 className={styles.title}>{name}</h3>
      {data && (
        <>
          <ul
            className={cx(styles.headTable, visible && styles.headTableVisible)}
          >
            <ListItem
              amount={numberFormatter.format(data.availableThisMonth.amount)}
              title="Available Funds"
            />
            <ListItem
              amount={numberFormatter.format(data.overspendPrevMonth)}
              title={`Overspend in ${format(subMonths(date, 1), 'MMM')}`}
            />
            {data.uncategorized.amount !== 0 && (
              <ListItem
                amount={numberFormatter.format(data.uncategorized.amount)}
                title="Uncategorized"
              />
            )}
            <ListItem
              amount={numberFormatter.format(
                data.total.budgeted === 0 ? 0 : data.total.budgeted * -1,
              )}
              title="Budgeted"
            />
            <ListItem
              className={budgetClasses}
              amount={numberFormatter.format(data.toBudget)}
              title={data.toBudget >= 0 ? 'To Budget' : 'Overbudgeted'}
            />
          </ul>
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
