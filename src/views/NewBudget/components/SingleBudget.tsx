import React, { MutableRefObject, useMemo } from 'react';
import cx from 'classnames';
import { StepCompProps } from '../Types';
import styles from '../NewBudget.module.scss';
import { MonthData, useBudgetData } from '../../../budget';
import Month from '../../Month';
import { useSyncScrollY } from '../../../lib';

type InterMonthData = ReturnType<MonthData['get']>;

function zeroAll(data: InterMonthData): InterMonthData {
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

export default function SingleBudget({
  state,
  moneyMoney,
  innerRef,
  syncScrollY,
  small,
  numberFormatter,
  mapMonthData = zeroAll,
}: StepCompProps & {
  mapMonthData?: (data: InterMonthData) => InterMonthData;
  small?: boolean;
  innerRef?: MutableRefObject<HTMLDivElement | null>;
  syncScrollY?: MutableRefObject<HTMLDivElement | null>;
}) {
  const { months, categories } = useBudgetData(state, moneyMoney);
  const syncScroll = useSyncScrollY(syncScrollY);
  const month = useMemo<MonthData>(() => {
    return {
      ...months[0],
      get: () => mapMonthData(months[0].get()),
    };
  }, [months, mapMonthData]);

  return (
    <div
      className={cx(
        styles.singleBudgetWrap,
        small && styles.singleBudgetWrapSmall,
      )}
      ref={innerRef}
      onScroll={syncScroll}
    >
      <Month
        width="full"
        key={month.key}
        monthKey={month.key}
        date={month.date}
        initialVisible={true}
        collapsedCategories={state.settings.collapsedCategories}
        month={month}
        categories={categories || []}
        numberFormatter={numberFormatter}
      />
    </div>
  );
}
