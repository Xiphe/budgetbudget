import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { ThrowReporter } from 'io-ts/lib/ThrowReporter';

export const VERSION = '0.0.1';

const categoryShape = t.intersection([
  t.type({
    amount: t.number,
  }),
  t.partial({
    rollover: t.boolean,
  }),
]);
const budgetShape = t.type({
  categories: t.record(t.string, t.union([categoryShape, t.undefined])),
});
const budgetsShape = t.record(
  t.string,
  t.union([budgetShape, t.undefined]),
  'budgets',
);
const incomeCategoryShape = t.type(
  {
    id: t.number,
    availableIn: t.number,
  },
  'incomeCategories',
);
const settingsShape = t.type(
  {
    numberLocale: t.string,
    fractionDigits: t.number,
    startDate: t.number,
    currency: t.string,
    startBalance: t.number,
    accounts: t.array(t.string),
    incomeCategories: t.array(incomeCategoryShape),
  },
  'settings',
);
const budgetStateShape = t.intersection(
  [
    t.partial(
      {
        name: t.string,
      },
      'optional',
    ),
    t.type(
      {
        version: t.string,
        budgets: t.record(t.string, t.union([t.undefined, budgetsShape])),
        settings: settingsShape,
      },
      'required',
    ),
  ],
  'budget',
);

export type Category = t.TypeOf<typeof categoryShape>;
export type BudgetState = t.TypeOf<typeof budgetStateShape>;
export type Budget = t.TypeOf<typeof budgetShape>;
export type Budgets = t.TypeOf<typeof budgetsShape>;
export type IncomeCategory = t.TypeOf<typeof incomeCategoryShape>;
export type Settings = t.TypeOf<typeof settingsShape>;

export function validateBudgetState(data: unknown): BudgetState {
  const c = budgetStateShape.decode(data);
  if (isLeft(c)) {
    throw ThrowReporter.report(c);
  }
  return data as BudgetState;
}
