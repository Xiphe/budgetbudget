import { Settings, IncomeCategory } from '../../src/budget/Types';
import faker from 'faker';

export function createIncomeCategory(
  category: Partial<IncomeCategory> = {},
): IncomeCategory {
  return {
    id: faker.random.uuid(),
    availableIn: 0,
    ...category,
  };
}

export default function createSettings(
  settings: Partial<Settings> = {},
): Settings {
  return {
    accounts: [faker.random.uuid()],
    currency: 'EUR',
    incomeCategories: [createIncomeCategory()],
    fractionDigits: 2,
    startDate: 1562450400000,
    startBalance: 0,
    ignorePendingTransactions: false,
    ...settings,
  };
}
