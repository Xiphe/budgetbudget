import { useMemo } from 'react';
import { createNumberFormatter } from '../lib';
import { useTransactions, Transaction, getCategories } from '../moneymoney';
import { BudgetState } from './Types';
import useBudgets from './useBudgets';

function transactionsLoaded(
  transactions: Transaction[] | Error | null,
): transactions is Transaction[] {
  return Array.isArray(transactions);
}

export default function useBudgetData(state: BudgetState) {
  const currency = 'EUR'; /* TODO: make editable */
  const { fractionDigits, numberLocale, incomeCategories } = state.settings;

  const numberFormatter = useMemo(
    () => createNumberFormatter(fractionDigits, numberLocale),
    [fractionDigits, numberLocale],
  );
  const [transactions, retryLoadTransactions] = useTransactions(
    state.settings.accounts,
  );
  const incomeCategoryIds = useMemo(
    () => incomeCategories.map(({ id }) => id),
    [incomeCategories],
  );
  const categories = useMemo(
    () =>
      transactionsLoaded(transactions)
        ? getCategories(transactions, incomeCategoryIds)
        : undefined,
    [transactions, incomeCategoryIds],
  );
  const budgets = useBudgets(
    transactionsLoaded(transactions) ? transactions : undefined,
    categories,
    state,
    currency,
  );

  return {
    currency,
    error: transactions instanceof Error ? transactions : null,
    retry: transactions instanceof Error ? retryLoadTransactions : null,
    budgets,
    categories,
    numberFormatter,
  };
}
