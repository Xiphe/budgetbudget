import { Transaction, validateTransactionByAccount } from './Types';
import format from 'date-fns/format';
import { ipcRenderer } from 'electron';

export default async function getTransactions(
  accountNumbers: string[],
  currency: string,
  startDateTimestamp: number,
): Promise<Transaction[]> {
  const startDate = format(new Date(startDateTimestamp), 'yyyy-MM-dd');
  const transactionsByAccount = validateTransactionByAccount(
    await ipcRenderer.invoke(
      'MM_EXPORT_TRANSACTIONS',
      accountNumbers,
      startDate,
    ),
  );

  return transactionsByAccount.reduce(
    (memo, { transactions }) =>
      memo.concat(transactions.filter(({ currency: c }) => c === currency)),
    [] as Transaction[],
  );
}
