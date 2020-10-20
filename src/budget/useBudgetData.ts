import type { MoneyMoneyRes } from '../moneymoney';
import { BudgetState } from './Types';
import useBudgets from './useBudgets';
import useFilteredCategories from './useFilteredCategories';

export default function useBudgetData(
  state: BudgetState,
  { readCategories, readTransactions }: MoneyMoneyRes,
) {
  const { incomeCategories } = state.settings;

  const transactions = readTransactions();
  const [categories, defaultCategories] = readCategories();
  const usableCategories = useFilteredCategories(incomeCategories, categories);

  const [months, extendFuture] = useBudgets(
    transactions,
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
