import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import isAfter from 'date-fns/isAfter';
import { getToday } from '../lib';
import {
  getAccounts,
  getTransactions,
  filterAccounts,
  Transaction,
  Account,
} from '../moneymoney';

import { BudgetState, IncomeCategory, VERSION } from './Types';

function getStartBalance(
  startDate: Date,
  transactions: Transaction[],
  accounts: Account[],
): number {
  const transactionsSinceStart = transactions.filter(({ bookingDate }) =>
    isAfter(bookingDate, startDate),
  );
  const transactionBal = transactionsSinceStart.reduce(
    (m, { amount }) => m + amount,
    0,
  );
  const accountsBal = accounts.reduce((m, { balance }) => m + balance, 0);

  return accountsBal + transactionBal * -1;
}

function isLaterHalfOfMonth({ bookingDate }: Transaction) {
  return bookingDate.getDate() >= 15;
}

function getIncomeCategories(transactions: Transaction[]): IncomeCategory[] {
  const transactionsByCat = transactions.reduce((memo, transaction) => {
    const { categoryUuid, amount } = transaction;

    if (!memo[categoryUuid]) {
      memo[categoryUuid] = { transactions: [], balance: 0, hasNegative: false };
    }

    memo[categoryUuid].transactions.push(transaction);
    memo[categoryUuid].balance += amount;
    if (amount < 0) {
      memo[categoryUuid].hasNegative = true;
    }

    return memo;
  }, {} as { [key: string]: { transactions: Transaction[]; balance: number; hasNegative: boolean } });

  const positiveCats = Object.entries(transactionsByCat)
    .filter(([_, { hasNegative }]) => !hasNegative)
    .sort(([_, { balance: a }], [__, { balance: b }]) => b - a);

  return positiveCats.map(([id, { transactions }]) => ({
    id,
    availableIn: transactions.some(isLaterHalfOfMonth) ? 1 : 0,
  }));
}

export default async function createInitialState(): Promise<BudgetState> {
  const [allAccounts, allTransactions] = await Promise.all([
    getAccounts(),
    getTransactions(),
  ]);
  const currenciesWithUsage = allAccounts.reduce(
    (memo, { group, currency }) => {
      if (group) {
        return memo;
      }
      memo[currency] = (memo[currency] || 0) + 1;
      return memo;
    },
    { USD: 1 } as { [key: string]: number },
  );
  const currenciesByUsage = Object.entries(currenciesWithUsage)
    .sort(([_, a], [__, b]) => b - a)
    .map(([c]) => c);
  const currency = currenciesByUsage[0];
  const accounts = filterAccounts(currency, allAccounts).filter(
    ({ group, portfolio }) => !group && !portfolio,
  );
  const accountUuids = accounts.map(({ uuid }) => uuid);
  const transactionsOfAccounts = allTransactions.filter(({ accountUuid }) =>
    accountUuids.includes(accountUuid),
  );
  const startDate = startOfMonth(subMonths(getToday(), 1));

  return {
    name: '',
    version: VERSION,
    budgets: {},
    settings: {
      currency,
      incomeCategories: getIncomeCategories(transactionsOfAccounts),
      accounts: accountUuids,
      fractionDigits: 2,
      startDate: startDate.getTime(),
      startBalance: getStartBalance(
        startDate,
        transactionsOfAccounts,
        accounts,
      ),
    },
  };
}
