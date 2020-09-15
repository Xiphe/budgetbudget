import { Transaction, validateTransactionByAccount } from './Types';
import format from 'date-fns/format';
import { ipcRenderer } from 'electron';
import { createResource, Resource } from '../lib';
import memoizeOne from 'memoize-one';

export type TransactionsResource = Resource<Transaction[]>;

const filterCurrency = memoizeOne(
  (currency: string, transactions: Transaction[]) =>
    transactions.filter(({ currency: c }) => c === currency),
);
export async function getTransactions(
  accountNumbers: string[],
  startDateTimestamp: number,
): Promise<Transaction[]> {
  if (accountNumbers.length === 0) {
    return [];
  }

  const startDate = format(new Date(startDateTimestamp), 'yyyy-MM-dd');
  const transactionsByAccount = validateTransactionByAccount(
    await ipcRenderer.invoke(
      'MM_EXPORT_TRANSACTIONS',
      accountNumbers,
      startDate,
    ),
  );

  return transactionsByAccount.reduce(
    (memo, { transactions }) => memo.concat(transactions),
    [] as Transaction[],
  );
}

export default function getTransactionsResource(
  accountNumbers: string[],
  currency: string,
  startDateTimestamp: number,
): TransactionsResource {
  return createResource(() =>
    getTransactions(accountNumbers, startDateTimestamp).then(
      filterCurrency.bind(null, currency),
    ),
  );
}
