import { Transaction, validateTransaction } from './Types';
import { PlistObject } from 'plist';
import format from 'date-fns/format';
import { ipcRenderer } from 'electron';

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
  currency: string,
  startDate: string,
): Promise<Transaction[]> {
  const resp: unknown = await ipcRenderer.invoke(
    'MM_EXPORT_TRANSACTIONS',
    accountNumber,
    startDate,
  );

  if (!isPlistObject(resp)) {
    throw new Error('Unexpectedly got non-object as transaction list');
  }

  if (!isArray(resp.transactions)) {
    throw new Error('Unexpectedly got non-array as transactions');
  }

  return resp.transactions.filter((data: unknown): data is Transaction => {
    if (typeof data !== 'object' || data === null) {
      throw new Error('Unexpectedly got non-object as transaction');
    }
    const transaction = validateTransaction({ accountNumber, ...data });
    return transaction.currency === currency;
  });
}

export default async function getTransactions(
  accountNumbers: string[],
  currency: string,
  startDateTimestamp: number,
): Promise<Transaction[]> {
  const startDate = format(new Date(startDateTimestamp), 'yyyy-MM-dd');
  return (
    await Promise.all(
      accountNumbers.map((accountNumber) =>
        getAccountTransactions(accountNumber, currency, startDate),
      ),
    )
  ).reduce((memo, transactions) => memo.concat(transactions), []);
}
