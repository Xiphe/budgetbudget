import { remote } from 'electron';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import getToday from './getToday';

export default {
  accounts: [],
  currency: 'EUR',
  incomeCategories: [],
  fractionDigits: 2,
  startDate: startOfMonth(subMonths(getToday(), 1)).getTime(),
  startBalance: 0,
  numberLocale: remote.app.getLocale(),
};
