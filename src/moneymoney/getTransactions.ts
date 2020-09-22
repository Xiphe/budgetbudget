import { Transaction, validateTransactionByAccount } from './Types';
import format from 'date-fns/format';
import { ipcRenderer } from 'electron';
import { createResource, Resource } from '../lib';
import memoizeOne from 'memoize-one';

export type TransactionsResource = Resource<Transaction[]>;

export const filterCurrency = memoizeOne(
  (currency: string, transactions: Transaction[]) =>
    transactions.filter(({ currency: c }) => c === currency),
);

async function getTransactions(
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
  p: Promise<{
    accounts: string[];
    startDate: number;
  }>,
): TransactionsResource {
  return createResource(async () => {
    const { accounts, startDate } = await p;
    return getTransactions(accounts, startDate);
  });
}
