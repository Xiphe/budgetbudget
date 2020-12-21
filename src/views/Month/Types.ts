import { MonthData, BudgetAction } from '../../budget';
import { Dispatch } from 'react';
import { Category } from '../../moneymoney';

export type Props = {
  dispatch?: Dispatch<BudgetAction>;
  monthKey: string;
  collapsedCategories?: string[];
  date: Date;
  categories: Category[];
  month: MonthData;
};
