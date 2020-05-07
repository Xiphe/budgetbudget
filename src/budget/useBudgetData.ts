import { useMemo } from 'react';
import { createNumberFormatter, isError } from '../lib';
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
    accounts,
    currency,
    startDate,
  } = state.settings;

  const numberFormatter = useMemo(
    () => createNumberFormatter(fractionDigits, numberLocale),
    [fractionDigits, numberLocale],
  );
  const [transactions, retryLoadTransactions] = useTransactions(
    startDate,
    currency,
    accounts,
  );

  const [categories, defaultCategories, retryLoadCategories] = useCategories(
    currency,
  );
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
  const retry = useMemo(() => {
    if (isError(transactions) && isError(categories)) {
      return () => {
        retryLoadTransactions();
        retryLoadCategories();
      };
    }
    if (isError(transactions)) {
      return retryLoadTransactions;
    }
    if (isError(categories)) {
      return retryLoadCategories;
    }
    return null;
  }, [transactions, retryLoadTransactions, categories, retryLoadCategories]);

  return {
    loading: !transactionsLoaded(transactions) || !categoriesLoaded(categories),
    error: isError(transactions)
      ? transactions
      : isError(categories)
      ? categories
      : null,
    retry,
    months,
    categories: usableCategories,
    extendFuture,
    numberFormatter,
  };
}
