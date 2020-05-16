import { useMemo } from 'react';
import { createNumberFormatter } from '../lib';
import {
  useTransactions,
  Transaction,
  Category,
  useCategories,
} from '../moneymoney';
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

export default function useBudgetData(state: BudgetState) {
  const {
    fractionDigits,
    numberLocale,
    incomeCategories,
    currency,
  } = state.settings;

  const numberFormatter = useMemo(
    () => createNumberFormatter(fractionDigits, numberLocale),
    [fractionDigits, numberLocale],
  );
  const transactions = useTransactions().read(currency);

  const [categories, defaultCategories] = useCategories().read(currency);
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
