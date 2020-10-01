import { Transaction, validateTransactions } from './Types';
import { ipcRenderer } from 'electron';
import { createResource } from '../lib';
import { TransactionsResource } from './getTransactions';
import memoizeOne from 'memoize-one';

export async function getAllTransactions(): Promise<Transaction[]> {
  return validateTransactions(
    await ipcRenderer.invoke('MM_EXPORT_ALL_TRANSACTIONS'),
  ).transactions;
}
const getAllTransactionsMemo = memoizeOne((cacheToken: symbol) =>
  getAllTransactions(),
);

function getAllTransactionsResource(cacheToken: symbol): TransactionsResource {
  return createResource(() => getAllTransactionsMemo(cacheToken));
}

export default memoizeOne(getAllTransactionsResource);
