import { Transaction, AmountWithTransactions, Balances } from './Types';
import { formatDateKey } from '../lib';

export default function calculateBalances(
  transactions: Transaction[],
  defaultCategoryIds: string[],
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

    const categoryId = transaction.categoryUuid;

    let amount: AmountWithTransactions;
    if (defaultCategoryIds.includes(categoryId)) {
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
