import { BudgetCategoryRow } from '../../../budget';
import faker from 'faker';

let i = 0;

export function createCategoryRow({
  budgeted = 0,
  spend = 0,
  balance = 0,
  name = `${faker.commerce.department()}${i++}`,
  uuid = `${faker.random.uuid()}${i}`,
  indentation = 0,
  overspendRollover = false,
  group = false,
  transactions = [],
}: Partial<BudgetCategoryRow>): BudgetCategoryRow {
  return {
    budgeted,
    spend,
    balance,
    name,
    uuid,
    indentation,
    overspendRollover,
    group,
    transactions,
  };
}
