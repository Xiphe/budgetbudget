import { useMemo, useState, useCallback } from 'react';
import addMonths from 'date-fns/addMonths';
import isAfter from 'date-fns/isAfter';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import { formatDateKey, roundWithFractions, getToday } from '../lib';
import getMonthData from './getMonthData';
import { Transaction, Category, calculateBalances } from '../moneymoney';
import { BudgetState, MonthData, InterMonthData } from './Types';

const EMPTY_TRANSACTIONS: Transaction[] = [];

export default function useBudgets(
  transactions: Transaction[] = EMPTY_TRANSACTIONS,
  categories: Category[] = [],
  defaultCategories: Category[] = [],
  {
    budgets,
    settings: { incomeCategories, fractionDigits, startBalance, startDate },
  }: BudgetState,
): [MonthData[], (add: number) => void] {
  const defaultCategoryIds = useMemo(
    () => defaultCategories.map(({ uuid }) => uuid),
    [defaultCategories],
  );
  const balances = useMemo(
    () => calculateBalances(transactions, defaultCategoryIds),
    [transactions, defaultCategoryIds],
  );
  const getInitial = useMemo(() => {
    const initial: InterMonthData = {
      startBalance,
      uncategorized: { amount: 0, transactions: [] },
      total: { budgeted: 0, spend: 0, balance: 0 },
      categories: [],
      prevMonth: {
        toBudget: 0,
        overspend: 0,
      },
      toBudget: 0,
      income: { amount: 0, transactions: [] },
      overspendRolloverState: {},
      rollover: { total: 0 },
      available: [],
    };
    return () => initial;
  }, [startBalance]);
  const round = useMemo(() => roundWithFractions(fractionDigits), [
    fractionDigits,
  ]);
  const [future, setFuture] = useState<number>(0);
  const displayDates = useMemo(() => {
    const today = getToday();
    const sorted = Object.keys(balances)
      .concat(Object.keys(budgets))
      .concat(formatDateKey(new Date(startDate)))
      .sort();
    const lastExisting = sorted[sorted.length - 1];
    const lastPlusFuture = lastExisting
      ? addMonths(new Date(lastExisting), future)
      : addMonths(today, future);
    const last =
      lastPlusFuture && isAfter(today, lastPlusFuture) ? today : lastPlusFuture;
    const first = sorted[0] ? new Date(sorted[0]) : today;
    let prev = {
      get: getInitial,
    } as MonthData;
    return Array(differenceInCalendarMonths(last, first) + 1)
      .fill('')
      .map((_, i) => {
        const key = formatDateKey(addMonths(first, i));

        prev = getMonthData(key)(
          prev.get,
          balances[key],
          budgets[key],
          categories,
          incomeCategories,
          round,
        );

        return prev;
      });
  }, [
    getInitial,
    startDate,
    balances,
    budgets,
    future,
    categories,
    incomeCategories,
    round,
  ]);

  return [
    displayDates,
    useCallback((add: number) => setFuture((prev) => prev + add), []),
  ];
}
