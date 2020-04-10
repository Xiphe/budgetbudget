import { Transaction, Currency } from './Types';
import { parse, PlistObject } from 'plist';
import { ipcRenderer } from '../lib';

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
  const resp = parse(
    await ipcRenderer.invoke(
      'MM_EXPORT_TRANSACTIONS',
      accountNumber,
      '1.1.1980',
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
}

export default async function getTransactions(
  accountNumbers: string[],
): Promise<Transaction[]> {
  return (await Promise.all(accountNumbers.map(getAccountTransactions))).reduce(
    (memo, transactions) => memo.concat(transactions),
    [],
  );
}
