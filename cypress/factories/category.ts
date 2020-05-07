import { Category } from '../../src/moneymoney/Types';
import faker from 'faker';

const SOME_ICON =
  'data:image/png;base64,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';

let i = 0;
export default function createCategory(
  category: Partial<Category> = {},
): Category {
  i++;

  return {
    budget: { amount: 0, available: 0, period: 'monthly' },
    currency: 'EUR',
    default: false,
    group: false,
    icon: SOME_ICON,
    indentation: 0,
    name: `${faker.commerce.department()}${i}`,
    uuid: `${faker.random.uuid()}${i}`,
    ...category,
  };
}
