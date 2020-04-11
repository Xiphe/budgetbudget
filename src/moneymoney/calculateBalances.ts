import { Transaction, AmountWithTransactions, Balances } from './Types';
import { formatDateKey } from '../lib';

export default function calculateBalances(
  transactions: Transaction[],
): Balances {
  return transactions.reduce((memo, transaction) => {
    const key = formatDateKey(transaction.bookingDate);
    let balance = memo[key];
    if (!balance) {
      balance = {
        total: 0,
        categories: {},
        uncategorised: {
          amount: 0,
          transactions: [],
        },
      };
      memo[key] = balance;
    }

    balance.total += transaction.amount;

    const categoryId = transaction.categoryId;

    let amount: AmountWithTransactions;
    if (categoryId === undefined) {
      amount = balance.uncategorised;
    } else {
      if (!balance.categories[categoryId]) {
        balance.categories[categoryId] = {
          amount: 0,
          transactions: [],
        };
      }
      amount = balance.categories[categoryId];
    }
    amount.amount += transaction.amount;
    amount.transactions.push(transaction);

    return memo;
  }, {} as Balances);
}
