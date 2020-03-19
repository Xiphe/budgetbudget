import { MonthlyBalance } from '../../../shared/MoneyMoneyApiTypes';
import { getBalancesAndCategories } from '../helpers';

export default async function getTransactions(): Promise<MonthlyBalance[]> {
  const { balances } = await getBalancesAndCategories();
  return balances;
}
