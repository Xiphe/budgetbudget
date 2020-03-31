import { NumberFormatter } from '../../lib';
import { BudgetListEntry } from '../../budget';

export type Props = {
  date: Date;
  numberFormatter: NumberFormatter;
  budget: BudgetListEntry;
};
