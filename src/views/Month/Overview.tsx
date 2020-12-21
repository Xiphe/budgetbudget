import React, { ReactNode } from 'react';
import cx from 'classnames';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import styles from './Month.module.scss';
import { MonthData, DetailedMonthData } from '../../budget';
import { useNumberFormatter } from '../../lib';
import { InterMonthData } from '../../budget/Types';

type ListItemProps = {
  amount: string;
  title: string;
  big?: boolean;
  negative?: boolean;
};
export function ListItem({ amount, title, big, negative }: ListItemProps) {
  return (
    <li
      aria-label={`${amount} ${title}`}
      className={cx(big && styles.bigBudget, negative && styles.negative)}
    >
      <span>{amount}</span>
      <span>{title}</span>
    </li>
  );
}

type ToBudgetProps = {
  toBudget: number;
};
export function ToBudget({ toBudget }: ToBudgetProps) {
  const numberFormatter = useNumberFormatter();
  return (
    <ListItem
      big={toBudget !== 0}
      negative={toBudget < 0}
      amount={numberFormatter.format(toBudget === -0 ? 0 : toBudget)}
      title={toBudget >= 0 ? 'To Budget' : 'Overbudgeted'}
    />
  );
}

export function Title(props: { children: ReactNode }) {
  return <h3 className={styles.title}>{props.children}</h3>;
}

export function HadTable(props: { children: ReactNode }) {
  return <ul className={cx(styles.headTable)}>{props.children}</ul>;
}

export function BudgetTotals({
  budgeted,
  spend,
  balance,
}: InterMonthData['total']) {
  const numberFormatter = useNumberFormatter();
  return (
    <div className={cx(styles.budgetTotals)}>
      <div>
        Budgeted
        <br />
        <span>{numberFormatter.format(budgeted)}</span>
      </div>
      <div>
        Spend
        <br />
        <span>{numberFormatter.format(spend)}</span>
      </div>
      <div>
        Balance
        <br />
        <span>{numberFormatter.format(balance)}</span>
      </div>
    </div>
  );
}

type Props = {
  month: MonthData;
  data?: DetailedMonthData;
};
export default function Overview({ month: { name, date }, data }: Props) {
  const numberFormatter = useNumberFormatter();

  return (
    <div>
      <Title>{name}</Title>
      {data && (
        <>
          <HadTable>
            {data.prevMonth.startBalance !== undefined && (
              <ListItem
                amount={numberFormatter.format(data.prevMonth.startBalance)}
                title="Start Balance"
              />
            )}
            {data.prevMonth.toBudget > 0 && (
              <ListItem
                amount={numberFormatter.format(data.prevMonth.toBudget)}
                title={`Not Budgeted in ${format(subMonths(date, 1), 'MMM')}`}
              />
            )}
            {data.prevMonth.toBudget < 0 && (
              <ListItem
                amount={numberFormatter.format(data.prevMonth.toBudget)}
                title={`OverBudgeted in ${format(subMonths(date, 1), 'MMM')}`}
              />
            )}
            <ListItem
              amount={numberFormatter.format(data.income.amount)}
              title="Income"
            />
            {data.prevMonth.overspend !== 0 && (
              <ListItem
                amount={numberFormatter.format(data.prevMonth.overspend)}
                title={`Overspend in ${format(subMonths(date, 1), 'MMM')}`}
              />
            )}
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
            <ToBudget toBudget={data.toBudget} />
          </HadTable>
          <BudgetTotals {...data.total} />
        </>
      )}
    </div>
  );
}
