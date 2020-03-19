import { CategoryTree } from '../../../shared/MoneyMoneyApiTypes';
import { getBalancesAndCategories } from '../helpers';

export default async function getCategories(): Promise<CategoryTree[]> {
  const { categories } = await getBalancesAndCategories();
  return categories;
}
