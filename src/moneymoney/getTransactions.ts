import { Transaction, validateTransactions } from './Types';
import format from 'date-fns/format';
import { ipcRenderer } from 'electron';
import { createResource, Resource } from '../lib';
import memoizeOne from 'memoize-one';

export type TransactionsResource = Resource<Transaction[]>;

export const filterCurrency = memoizeOne(
  (currency: string, transactions: Transaction[]) =>
    transactions.filter(({ currency: c }) => c === currency),
);

export async function getTransactions(): Promise<Transaction[]>;
export async function getTransactions(
  accountNumbers: string[],
  startDateTimestamp: number,
): Promise<Transaction[]>;
export async function getTransactions(
  accountNumbers?: string[],
  startDateTimestamp?: number,
): Promise<Transaction[]> {
  if (!accountNumbers || !startDateTimestamp) {
    return validateTransactions(
      await ipcRenderer.invoke('MM_EXPORT_TRANSACTIONS'),
    );
  }

  if (accountNumbers.length === 0) {
    return [];
  }

  const startDate = format(new Date(startDateTimestamp), 'yyyy-MM-dd');

  return validateTransactions(
    await ipcRenderer.invoke(
      'MM_EXPORT_TRANSACTIONS',
      accountNumbers,
      startDate,
    ),
  );
}

export default function getTransactionsResource(settings: {
  accounts: string[];
  startDate: number;
}): TransactionsResource {
  return createResource(() =>
    getTransactions(settings.accounts, settings.startDate),
  );
}
