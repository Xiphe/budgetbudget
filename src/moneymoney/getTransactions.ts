import { Transaction, validateTransactionByAccount } from './Types';
import format from 'date-fns/format';
import { ipcRenderer } from 'electron';
import { createResource } from '../lib';
import memoizeOne from 'memoize-one';
import { Resource } from '../lib/createResource';

export type TransacionsResource = Resource<Transaction[]>;

const filterCurrency = memoizeOne(
  (transactions: Transaction[], currency: string) =>
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
const getTransactionsMemo = memoizeOne(getTransactions);

function getTransactionsResource(
  accountNumbers: string[],
  currency: string,
  startDateTimestamp: number,
): TransacionsResource {
  return createResource(async () =>
    filterCurrency(
      await getTransactionsMemo(accountNumbers, startDateTimestamp),
      currency,
    ),
  );
}

export default memoizeOne(getTransactionsResource);
