import { Category } from '../../../shared/MoneyMoneyApiTypes';
import { getTransactionsAndCategories } from '../helpers';

export default async function getCategories(): Promise<Category[]> {
  const { categories } = await getTransactionsAndCategories();
  return categories;
}
