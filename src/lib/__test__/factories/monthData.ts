import format from 'date-fns/format';
import { MonthData, DetailedMonthData } from '../../../budget';
import formatDateKey from '../../formatDateKey';

export function createMonthData(
  date: Date,
  {
    uncategorized = { amount: 0, transactions: [] },
    categories = [],
    toBudget = 0,
    total = { spend: 0, balance: 0, budgeted: 0 },
    prevMonth = { overspend: 0, toBudget: 0 },
    overspendRolloverState = {},
    available = [],
    income = { amount: 0, transactions: [] },
    rollover = { total: 0 },
  }: Partial<DetailedMonthData> = {},
): MonthData {
  return {
    key: formatDateKey(date),
    date,
    name: format(date, 'MMMM'),
    get: () => ({
      uncategorized,
      categories,
      toBudget,
      total,
      income,
      prevMonth,
      overspendRolloverState,
      available,
      rollover,
    }),
  };
}
