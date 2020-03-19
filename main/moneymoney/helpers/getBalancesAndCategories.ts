import {
  Transaction,
  CURRENCIES,
  Account,
  CategoryTree,
  CategoryGroup,
  MonthlyBalance,
  CategoryBalance,
  Month,
  MONTHS,
} from '../../../shared/MoneyMoneyApiTypes';
import { osascript } from '../../lib';
import { parse, PlistObject } from 'plist';
import isDbLocked from './isDbLocked';
import delay from '../../../shared/delay';
import { getAccounts } from '../handlers';

type TransactionWithoutAccountNumber = Omit<Transaction, 'accountNumber'>;

function isTransaction(
  transaction: any,
): transaction is TransactionWithoutAccountNumber {
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

function toTransaction(account: Account) {
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
  }: TransactionWithoutAccountNumber): Transaction => {
    return {
      id,
      amount,
      accountNumber: account.number,
      booked,
      bookingDate,
      valueDate,
      currency,
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
  account: Account,
  retry = 0,
): Promise<Transaction[]> {
  try {
    const resp = parse(
      await osascript(
        `tell application "MoneyMoney" to export transactions from account "${account.number}" from date "1.1.1980" as "plist"`,
      ),
    );

    if (!isPlistObject(resp)) {
      throw new Error('Unexpectedly got non-object as transaction list');
    }

    if (!isArray(resp.transactions)) {
      throw new Error('Unexpectedly got non-array as transactions');
    }

    return resp.transactions.filter(isTransaction).map(toTransaction(account));
  } catch (err) {
    if (isDbLocked(err)) {
      if (retry < 3) {
        await delay(retry * 500);
        return getAccountTransactions(account, retry + 1);
      }
      throw { retry: true, message: 'MoneyMoney database is locked' };
    }
    throw err;
  }
}

function mergeCatBalance(
  balances: CategoryBalance[] = [],
  transaction: Transaction,
) {
  let catBalance: CategoryBalance | undefined = balances.find(
    ({ currency }) => currency === transaction.currency,
  );
  if (!catBalance) {
    catBalance = {
      currency: transaction.currency,
      amount: transaction.amount,
      transactions: [transaction],
    };
    balances.push(catBalance);
  } else {
    catBalance.amount += transaction.amount;
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
          categories: {},
          uncategorised: [],
        };
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

export async function uncached(): Promise<{
  balances: MonthlyBalance[];
  categories: CategoryTree[];
}> {
  const accounts = await getAccounts();
  const accountTransactions = await Promise.all(
    accounts.map(getAccountTransactions),
  );
  const transactions = accountTransactions.reduce(
    (memo, transactions) => memo.concat(transactions),
    [],
  );

  return {
    balances: calculateBalances(transactions),
    categories: extractCategories(transactions),
  };
}

let lastCall = 0;
let cache: ReturnType<typeof uncached> | null = null;
const CACHING_TIME = 1000;
export default function getAllTransactionsAndCategories() {
  const now = new Date().getTime();
  if (!cache || lastCall < now - CACHING_TIME) {
    cache = uncached();
    cache.catch(() => (cache = null));
    lastCall = now;
  }

  return cache;
}
