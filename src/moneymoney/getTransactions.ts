import { Transaction, validateTransactionByAccount } from './Types';
import format from 'date-fns/format';
import { ipcRenderer } from 'electron';
import { createResource } from '../lib';
import memoizeOne from 'memoize-one';
import { Resource } from '../lib/createResource';

export type TransacionsResource = Resource<Transaction[]>;

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
const getTransactionsMemo = memoizeOne(
  (accountNumbers: string[], startDateTimestamp: number, cacheToken: symbol) =>
    getTransactions(accountNumbers, startDateTimestamp),
);

function getTransactionsResource(
  accountNumbers: string[],
  currency: string,
  startDateTimestamp: number,
  cacheToken: symbol,
): TransacionsResource {
  return createResource(
    getTransactionsMemo(accountNumbers, startDateTimestamp, cacheToken).then(
      filterCurrency.bind(null, currency),
    ),
  );
}

export default memoizeOne(getTransactionsResource);
