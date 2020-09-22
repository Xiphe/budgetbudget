import { useMemo } from 'react';
import { createNumberFormatter } from '../lib';
import type { Transaction, Category, MoneyMoneyRes } from '../moneymoney';
import { BudgetState } from './Types';
import useBudgets from './useBudgets';

function transactionsLoaded(
  transactions: Transaction[] | Error | null,
): transactions is Transaction[] {
  return Array.isArray(transactions);
}

function categoriesLoaded(
  categories: Category[] | Error | null,
): categories is Category[] {
  return Array.isArray(categories);
}

export default function useBudgetData(
  state: BudgetState,
  { readCategories, readTransactions }: MoneyMoneyRes,
) {
  const { fractionDigits, numberLocale, incomeCategories } = state.settings;

  const numberFormatter = useMemo(
    () => createNumberFormatter(fractionDigits, numberLocale),
    [fractionDigits, numberLocale],
  );
  const transactions = readTransactions();
  const [categories, defaultCategories] = readCategories();
  const usableCategories = useMemo(() => {
    if (!categoriesLoaded(categories)) {
      return [];
    }
    const incomeCategoryIds = incomeCategories
      .map(({ id }) => id)
      .filter((id): id is string => id !== null);
    return categories.filter(({ uuid }) => !incomeCategoryIds.includes(uuid));
  }, [incomeCategories, categories]);

  const [months, extendFuture] = useBudgets(
    transactionsLoaded(transactions) ? transactions : undefined,
    usableCategories,
    defaultCategories,
    state,
  );

  return {
    months,
    categories: usableCategories,
    extendFuture,
    numberFormatter,
  };
}
