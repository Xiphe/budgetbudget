import { useMemo } from 'react';
import { Category } from '../moneymoney';
import { BudgetState } from './Types';

export default function useFilteredCategories(
  incomeCategories: BudgetState['settings']['incomeCategories'],
  categories: Category[],
) {
  return useMemo(() => {
    const incomeCategoryIds = incomeCategories
      .map(({ id }) => id)
      .filter((id): id is string => id !== null);
    return categories.filter(({ uuid }) => !incomeCategoryIds.includes(uuid));
  }, [incomeCategories, categories]);
}
