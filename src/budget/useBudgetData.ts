import type { MoneyMoneyRes } from '../moneymoney';
import { BudgetState } from './Types';
import useBudgets from './useBudgets';
import useFilteredCategories from './useFilteredCategories';

export default function useBudgetData(
  state: BudgetState,
  moneyMoney: MoneyMoneyRes,
) {
  const { incomeCategories } = state.settings;

  const transactions = moneyMoney.transactions.read();
  const [categories, defaultCategories] = moneyMoney.categories.read();
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
