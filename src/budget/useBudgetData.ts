import type { Transaction, MoneyMoneyRes } from '../moneymoney';
import { BudgetState } from './Types';
import useBudgets from './useBudgets';
import useFilteredCategories from './useFilteredCategories';

function transactionsLoaded(
  transactions: Transaction[] | Error | null,
): transactions is Transaction[] {
  return Array.isArray(transactions);
}

export default function useBudgetData(
  state: BudgetState,
  { readCategories, readTransactions }: MoneyMoneyRes,
) {
  const { incomeCategories } = state.settings;

  const transactions = readTransactions();
  const [categories, defaultCategories] = readCategories();
  const usableCategories = useFilteredCategories(incomeCategories, categories);

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
  };
}
