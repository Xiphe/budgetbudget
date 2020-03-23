import {
  Transaction,
  CURRENCIES,
  CategoryTree,
  CategoryGroup,
  MonthlyBalance,
  Balance,
  Month,
  Currency,
} from './Types';
import { parse, PlistObject } from 'plist';
import { delay, osascript } from '../lib';
import isDbLocked from './isDbLocked';

type InteropTransaction = Omit<Transaction, 'accountNumber' | 'amount'> & {
  amount: number;
  currency: Currency;
};

function isTransaction(transaction: any): transaction is InteropTransaction {
  if (
    typeof transaction.amount === 'number' &&
    typeof transaction.booked === 'boolean' &&
    transaction.bookingDate instanceof Date &&
    transaction.valueDate instanceof Date &&
    typeof transaction.currency === 'string' &&
    CURRENCIES.includes(transaction.currency) &&
    typeof transaction.name === 'string' &&
    typeof transaction.id === 'number'
  ) {
    return true;
  }

  throw new Error(
    `Transaction schema mismatch on ${JSON.stringify(transaction)}`,
  );
}

function toTransaction(accountNumber: string) {
  return ({
    id,
    amount,
    booked,
    bookingDate,
    valueDate,
    currency,
    name,
    purpose,
    category,
    categoryId,
  }: InteropTransaction): Transaction => {
    return {
      id,
      amount: [amount, currency],
      accountNumber,
      booked,
      bookingDate,
      valueDate,
      name,
      purpose,
      category,
      categoryId,
    };
  };
}

function isCategoryGroup(cat: CategoryTree): cat is CategoryGroup {
  return Array.isArray((cat as CategoryGroup).children);
}

function extractCategories(transactions: Transaction[]) {
  let knownIds: number[] = [];
  return transactions.reduce((memo, { categoryId, category }) => {
    if (!category || !categoryId || knownIds.includes(categoryId)) {
      return memo;
    }

    knownIds.push(categoryId);

    return category.split('\\').reduce((group, name, i, all) => {
      if (i + 1 === all.length) {
        group.push({ id: categoryId, name });
        return memo;
      }

      const existing = group
        .filter(isCategoryGroup)
        .find((entry) => entry.name === name);

      if (existing) {
        return existing.children;
      }

      const newGroup = { name, children: [] };
      group.push(newGroup);

      return newGroup.children;
    }, memo);
  }, [] as CategoryTree[]);
}

function isPlistObject(val: any): val is PlistObject {
  return (
    typeof val === 'object' &&
    !(val instanceof Date) &&
    !(val instanceof Buffer) &&
    !Array.isArray(val)
  );
}

function isArray(val: any): val is any[] {
  return Array.isArray(val);
}

async function getAccountTransactions(
  accountNumber: string,
  retry = 0,
): Promise<Transaction[]> {
  try {
    const resp = parse(
      await osascript(
        `tell application "MoneyMoney" to export transactions from account "${accountNumber}" from date "1.1.1980" as "plist"`,
      ),
    );

    if (!isPlistObject(resp)) {
      throw new Error('Unexpectedly got non-object as transaction list');
    }

    if (!isArray(resp.transactions)) {
      throw new Error('Unexpectedly got non-array as transactions');
    }

    return resp.transactions
      .filter(isTransaction)
      .map(toTransaction(accountNumber));
  } catch (err) {
    if (isDbLocked(err)) {
      if (retry < 3) {
        await delay(retry * 500);
        return getAccountTransactions(accountNumber, retry + 1);
      }
      throw new Error('MoneyMoney database is locked');
    }
    throw err;
  }
}

function mergeCatBalance(balances: Balance[] = [], transaction: Transaction) {
  let catBalance: Balance | undefined = balances.find(
    ({ amount: [_, currency] }) => currency === transaction.amount[1],
  );
  if (!catBalance) {
    catBalance = {
      amount: [transaction.amount[0], transaction.amount[1]],
      transactions: [transaction],
    };
    balances.push(catBalance);
  } else {
    catBalance.amount[0] += transaction.amount[0];
    catBalance.transactions.push(transaction);
  }
  return balances;
}

function calculateBalances(transactions: Transaction[]): MonthlyBalance[] {
  return Object.entries(
    transactions.reduce((memo, transaction) => {
      const month = (transaction.bookingDate.getMonth() + 1) as Month;
      const year = transaction.bookingDate.getFullYear();
      const key = `${year}-${month}`;

      if (!memo[key]) {
        memo[key] = {
          month,
          year,
          total: [],
          categories: {},
          uncategorised: [],
        };
      }

      const total = memo[key].total.find(
        ([_, currency]) => currency === transaction.amount[1],
      );
      if (total) {
        total[0] += transaction.amount[0];
      } else {
        memo[key].total.push([transaction.amount[0], transaction.amount[1]]);
      }

      const categoryId = transaction.categoryId;
      if (categoryId === undefined) {
        mergeCatBalance(memo[key].uncategorised, transaction);
        return memo;
      } else {
        memo[key].categories[categoryId] = mergeCatBalance(
          memo[key].categories[categoryId],
          transaction,
        );
      }

      return memo;
    }, {} as { [key: string]: MonthlyBalance }),
  )
    .sort(([a], [b]) => {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      }
      return 0;
    })
    .map(([_, b]) => b);
}

export default async function getBalancesAndCategories(
  accountNumbers: string[],
): Promise<{
  balances: MonthlyBalance[];
  categories: CategoryTree[];
}> {
  const transactions = (
    await Promise.all(accountNumbers.map(getAccountTransactions))
  ).reduce((memo, transactions) => memo.concat(transactions), []);

  return {
    balances: calculateBalances(transactions),
    categories: extractCategories(transactions),
  };
}
