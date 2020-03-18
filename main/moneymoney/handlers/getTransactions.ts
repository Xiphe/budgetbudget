import { Transaction } from '../../../shared/MoneyMoneyApiTypes';
import { getTransactionsAndCategories } from '../helpers';

export default async function getTransactions(): Promise<Transaction[]> {
  const { transactions } = await getTransactionsAndCategories();
  return transactions;
}
