import { BudgetState } from '../../src/budget/Types';
import faker from 'faker';
import settings from './settings';

export default function createBudget(
  budget: Partial<BudgetState> = {},
): BudgetState {
  return {
    name: faker.company.companyName(),
    version: '0.0.2',
    budgets: {},
    settings: settings(),
    ...budget,
  };
}
