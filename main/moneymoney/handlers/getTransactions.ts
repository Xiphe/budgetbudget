import { Month, Transaction } from '../../../shared/MoneyMoneyApiTypes';
import { getTransactionsAndCategories } from '../helpers';

export default async function getTransactions(
  month: Month,
): Promise<Transaction[]> {
  const { transactions } = await getTransactionsAndCategories();
  return transactions.filter(({ bookingDate }) => {
    return bookingDate.getMonth() + 1 === month;
  });
}
