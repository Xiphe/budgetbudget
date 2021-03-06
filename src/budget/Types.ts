import * as t from 'io-ts';
import {
  Balance,
  Transaction,
  AmountWithTransactions,
  Category as MoneyMoneyCategory,
} from '../moneymoney';
import { isLeft } from 'fp-ts/lib/Either';
import { ThrowReporter } from 'io-ts/lib/ThrowReporter';
import semver from 'semver';

/**
 * ## 0.0.1 -> 0.0.2
 * now using uuids to reference categories and accounts
 *
 * ## 0.0.2 -> 0.0.3
 * removed setting.numberLocale in favor of always using system
 *
 * ## 0.0.3 -> 0.0.4
 * added setting.ignorePendingTransactions
 */
export const VERSION = '0.0.4';

const categoryShape = t.partial({
  amount: t.number,
  rollover: t.boolean,
});
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
    id: t.union([t.string, t.null]),
    availableIn: t.number,
  },
  'incomeCategories',
);
const settingsShape = t.type(
  {
    fractionDigits: t.number,
    ignorePendingTransactions: t.boolean,
    startDate: t.number,
    currency: t.string,
    startBalance: t.number,
    accounts: t.array(t.string),
    incomeCategories: t.array(incomeCategoryShape),
  },
  'settings',
);
const optionalSettingsShape = t.partial(
  {
    /** @deprecated */
    numberLocale: t.string,
    collapsedCategories: t.array(t.string),
  },
  'optionalSettings',
);
const budgetStateShape = t.type(
  {
    name: t.string,
    version: t.string,
    budgets: budgetsShape,
    settings: t.intersection([settingsShape, optionalSettingsShape]),
  },
  'budget',
);

export type Category = t.TypeOf<typeof categoryShape>;
export type BudgetState = t.TypeOf<typeof budgetStateShape>;
export type Budget = t.TypeOf<typeof budgetShape>;
export type Budgets = t.TypeOf<typeof budgetsShape>;
export type IncomeCategory = t.TypeOf<typeof incomeCategoryShape>;
export type Settings = t.TypeOf<typeof settingsShape>;

export function validateBudgetState(data: unknown): BudgetState {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid budget file format');
  }
  const version: string = (data as any).version as string;
  if (!version || !semver.valid(version) || !semver.satisfies(version, '>0.0.1')){
    throw new Error(
      'File format not supported. Please use an earlier version of BudgetBudget to open this file',
    );
  }
  // Upgrade to 0.0.4 version format
  if (semver.lt(version, '0.0.4')) {
    (data as any).settings.ignorePendingTransactions = false;
    (data as any).version = '0.0.4';
  }
  const c = budgetStateShape.decode(data);
  if (isLeft(c)) {
    throw ThrowReporter.report(c);
  }
  return data as BudgetState;
}

export type BudgetRow = { budgeted: number; spend: number; balance: number };

export type AmountWithPartialTransactions = {
  amount: number;
  transactions: Pick<Transaction, 'amount' | 'name' | 'purpose'>[];
};
export type BudgetListEntry = {
  key: string;
  date: Date;
  available: AmountWithPartialTransactions;
  overspendPrevMonth: number;
  toBudget: number;
  total: BudgetRow;
  uncategorized: AmountWithPartialTransactions;
  categories: BudgetCategoryRow[];
};

export type BudgetCategoryGroup = BudgetRow & {
  uuid: string;
  group: true;
  name: string;
  indentation: number;
};
export type BudgetCategoryRow = Omit<BudgetCategoryGroup, 'group'> & {
  overspendRollover: boolean;
  group: false;
  transactions: Transaction[];
};
export type OverspendRollover = { [key: string]: boolean };
export type Rollover = { total: number; [key: string]: number };

export type InterMonthData = {
  uncategorized: AmountWithTransactions;
  categories: (BudgetCategoryRow | BudgetCategoryGroup)[];
  toBudget: number;
  total: BudgetRow;
  income: AmountWithPartialTransactions;
  overspendPrevMonth: number;
  overspendRolloverState: OverspendRollover;
  available: AmountWithPartialTransactions[];
  availableThisMonth: AmountWithPartialTransactions;
  rollover: Rollover;
};
export type MonthData = {
  key: string;
  date: Date;
  name: string;
  get: () => InterMonthData;
};
export type MonthDataGetter<R> = (
  getInitial: () => InterMonthData,
  balance: Balance | undefined,
  budget: Budget | undefined,
  categories: MoneyMoneyCategory[],
  incomeCategories: IncomeCategory[],
  round: (value: number) => number,
) => R;
