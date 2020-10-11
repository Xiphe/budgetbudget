import { NumberFormatter } from '../../lib';
import { MonthData, Action } from '../../budget';
import { Dispatch } from 'react';
import { Category } from '../../moneymoney';

export type Props = {
  dispatch?: Dispatch<Action>;
  monthKey: string;
  collapsedCategories?: string[];
  date: Date;
  categories: Category[];
  numberFormatter: NumberFormatter;
  month: MonthData;
};
