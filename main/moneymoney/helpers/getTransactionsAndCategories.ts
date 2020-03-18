import {
  Transaction,
  CURRENCIES,
  Category,
  Account,
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

function extractCategories(transactions: Transaction[]) {
  return transactions.reduce(
    (memo, { categoryId, category }) => {
      if (!category || !categoryId) {
        return memo;
      }

      if (memo.find(({ id }) => id === categoryId)) {
        return memo;
      }

      const tokens = category.split('\\');
      const parents = tokens.splice(0, tokens.length - 1);
      const [name] = tokens;

      memo.push({ id: categoryId, name, parents });

      return memo;
    },
    [] as Category[],
  );
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
        `tell application "MoneyMoney" to export transactions from account "${
          account.number
        }" from date "1.1.1980" as "plist"`,
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

export async function uncached(): Promise<{
  transactions: Transaction[];
  categories: Category[];
}> {
  const accounts = await getAccounts();
  const accountTransactions = await Promise.all(
    accounts.map(getAccountTransactions),
  );
  const transactions = accountTransactions.reduce(
    (memo, transactions) => memo.concat(transactions),
    [],
  );

  return { transactions, categories: extractCategories(transactions) };
}

let lastCall = 0;
let cache: ReturnType<typeof uncached> | null = null;
const CACHING_TIME = 1000 * 60;
export default function getAllTransactionsAndCategories() {
  const now = new Date().getTime();
  if (!cache || lastCall < now - CACHING_TIME) {
    cache = uncached();
    cache.catch(() => (cache = null));
    lastCall = now;
  }

  return cache;
}
