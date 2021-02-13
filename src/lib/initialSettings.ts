import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import getToday from './getToday';
import { BudgetState } from '../budget';

const settings: BudgetState['settings'] = {
  accounts: [],
  currency: 'EUR',
  incomeCategories: [],
  fractionDigits: 2,
  ignorePendingTransactions: false,
  startDate: startOfMonth(subMonths(getToday(), 1)).getTime(),
  startBalance: 0,
};

export default settings;
