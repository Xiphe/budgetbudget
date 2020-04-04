import { Transaction, Currency } from './Types';
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

export default async function getTransactions(
  accountNumbers: string[],
): Promise<Transaction[]> {
  return (await Promise.all(accountNumbers.map(getAccountTransactions))).reduce(
    (memo, transactions) => memo.concat(transactions),
    [],
  );
}
