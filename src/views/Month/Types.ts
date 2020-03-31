import { NumberFormatter } from '../../lib';
import { BudgetListEntry, Action } from '../../budget';
import { Dispatch } from 'react';
import { CategoryTree } from '../../moneymoney/Types';

export type Props = {
  dispatch: Dispatch<Action>;
  monthKey: string;
  date: Date;
  categories: CategoryTree[];
  numberFormatter: NumberFormatter;
  budget: BudgetListEntry;
  currency: string;
};
