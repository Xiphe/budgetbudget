import React, { MutableRefObject, Dispatch, ComponentProps } from 'react';
import cx from 'classnames';
import { StepCompProps } from '../Types';
import styles from '../NewBudget.module.scss';
import { Action, MonthData } from '../../../budget';
import Month from '../../Month';
import { useSyncScrollY } from '../../../lib';
import { Category } from '../../../moneymoney';

type InterMonthData = ReturnType<MonthData['get']>;

export function zeroAll(data: InterMonthData): InterMonthData {
  return {
    income: { amount: 0, transactions: [] },
    prevMonth: { overspend: 0, toBudget: 0 },
    overspendRolloverState: {},
    rollover: { total: 0 },
    toBudget: 0,
    available: [],
    uncategorized: { amount: 0, transactions: [] },
    total: {
      balance: 0,
      budgeted: 0,
      spend: 0,
    },
    categories: data.categories.map((cat) => ({
      ...cat,
      balance: 0,
      budgeted: 0,
      spend: 0,
    })),
  };
}

export function noop(data: InterMonthData): InterMonthData {
  return data;
}

export function onlyIncome(data: InterMonthData): InterMonthData {
  return {
    income: data.income,
    prevMonth: { overspend: 0, toBudget: 0 },
    overspendRolloverState: {},
    rollover: { total: 0 },
    toBudget: data.income.amount,
    available: [],
    uncategorized: { amount: 0, transactions: [] },
    total: {
      balance: 0,
      budgeted: 0,
      spend: 0,
    },
    categories: data.categories.map((cat) => ({
      ...cat,
      balance: 0,
      budgeted: 0,
      spend: 0,
    })),
  };
}

type Props = StepCompProps & {
  fullHeight?: boolean;
  small?: boolean;
  dispatch?: Dispatch<Action>;
  children: ComponentProps<typeof Month>['children'];
  innerRef?: MutableRefObject<HTMLDivElement | null>;
  syncScrollY?: MutableRefObject<HTMLDivElement | null>;
  month: MonthData;
  categories: Category[];
};

export default function SingleBudget({
  state,
  innerRef,
  syncScrollY,
  small,
  fullHeight,
  dispatch,
  children,
  month,
  categories,
}: Props) {
  const syncScroll = useSyncScrollY(syncScrollY);

  return (
    <div
      className={cx(
        styles.singleBudgetWrap,
        small && styles.singleBudgetWrapSmall,
        fullHeight && styles.singleBudgetWrapFullHeight,
      )}
      ref={innerRef}
      onScroll={syncScroll}
    >
      <Month
        width="full"
        dispatch={dispatch}
        monthKey={month.key}
        date={month.date}
        initialVisible={true}
        collapsedCategories={state.settings.collapsedCategories}
        month={month}
        categories={categories || []}
      >
        {children}
      </Month>
    </div>
  );
}
