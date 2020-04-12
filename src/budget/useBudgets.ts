import { useMemo } from 'react';
import addMonths from 'date-fns/addMonths';
import isAfter from 'date-fns/isAfter';
import { BudgetState, Budgets, Budget, IncomeCategory } from './Types';
import {
  Balances,
  CategoryTree,
  Transaction,
  Balance,
  isCategory,
} from '../moneymoney/Types';
import { formatDateKey, roundWithFractions } from '../lib';
import { calculateBalances } from '../moneymoney';

export type BudgetRow = { budgeted: number; spend: number; balance: number };
export type BudgetCategoryRow = BudgetRow & {
  overspendRollover?: boolean;
  name: string;
  id?: number;
  transactions?: Transaction[];
  children?: BudgetCategoryRow[];
};
export type BudgetListEntry = {
  available: AmountWithPartialTransactions;
  overspendPrevMonth: number;
  toBudget: number;
  total: BudgetRow;
  uncategorized: AmountWithPartialTransactions;
  categories: BudgetCategoryRow[];
};
export type BudgetList = {
  [key: string]: undefined | BudgetListEntry;
};
type AmountWithPartialTransactions = {
  amount: number;
  transactions: Pick<Transaction, 'amount' | 'name' | 'purpose'>[];
};

const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_BUDGETS: BudgetList = {};

export const EMPTY_BUDGET: BudgetListEntry = {
  total: {
    budgeted: 0,
    spend: 0,
    balance: 0,
  },
  toBudget: 0,
  available: {
    amount: 0,
    transactions: [],
  },
  overspendPrevMonth: 0,
  uncategorized: {
    amount: 0,
    transactions: [],
  },
  categories: [],
};

function emptyBudgetRow(): BudgetRow {
  return { budgeted: 0, spend: 0, balance: 0 };
}

function useFirstLast(balances: Balances, budgets: Budgets) {
  return useMemo<
    [string | undefined, string | undefined, Date | undefined]
  >(() => {
    const sorted = Object.keys(balances).concat(Object.keys(budgets)).sort();
    const last = sorted[sorted.length - 1];
    return [sorted[0], last, last ? new Date(last) : undefined];
  }, [balances, budgets]);
}

type Rollover = { total: number; [key: number]: number };
type OverspendRollover = { [key: number]: boolean };
type GetCategoryRowsArgs = {
  overspendRolloverState: OverspendRollover;
  trees: CategoryTree[];
  balance?: Balance;
  budget?: Budget;
  round: (value: number) => number;
  rolloverCategories: Omit<Rollover, 'total'>;
  rollover: Rollover;
  parentRows: BudgetRow[];
};
function getCategoryRows({
  overspendRolloverState,
  trees,
  balance,
  budget,
  round,
  rolloverCategories,
  rollover,
  parentRows,
}: GetCategoryRowsArgs): BudgetCategoryRow[] {
  return trees
    .map((tree): BudgetCategoryRow | null => {
      if (!isCategory(tree)) {
        const row = emptyBudgetRow();
        const children = getCategoryRows({
          overspendRolloverState,
          trees: tree.children,
          balance,
          budget,
          round,
          rolloverCategories,
          rollover,
          parentRows: parentRows.concat(row),
        });
        if (!children.length) {
          return null;
        }

        return {
          ...row,
          name: tree.name,
          children,
        };
      } else {
        const budgetCat = (budget && budget.categories[tree.id]) || {
          amount: 0,
        };
        const budgeted = budgetCat.amount;
        const spend = (balance && balance.categories[tree.id]) || {
          amount: 0,
          transactions: [],
        };
        const overspendRolloverSetting = budgetCat.rollover;
        const overspendRollover =
          overspendRolloverSetting !== undefined
            ? overspendRolloverSetting
            : overspendRolloverState[tree.id] || false;
        overspendRolloverState[tree.id] = overspendRollover;

        const budgetCategoryBalance = round(
          budgeted + spend.amount + (rolloverCategories[tree.id] || 0),
        );
        parentRows.forEach((row) => {
          row.budgeted = round(row.budgeted + budgeted);
          row.spend = round(row.spend + spend.amount);
          row.balance = round(row.balance + budgetCategoryBalance);
        });

        if (budgetCategoryBalance > 0 || overspendRollover) {
          rollover[tree.id] = budgetCategoryBalance;
        } else if (budgetCategoryBalance < 0) {
          rollover.total += budgetCategoryBalance;
        }

        return {
          overspendRollover,
          budgeted: round(budgeted),
          spend: round(spend.amount),
          balance: budgetCategoryBalance,
          transactions: spend.transactions,
          id: tree.id,
          name: tree.name,
        };
      }
    })
    .filter((entry): entry is BudgetCategoryRow => Boolean(entry));
}

function assignAvailable(
  incomeCategories: IncomeCategory[],
  available: AmountWithPartialTransactions[],
  balance: Balance,
) {
  incomeCategories.forEach(({ id, availableIn }) => {
    if (!id) {
      return;
    }
    if (balance.categories[id]) {
      if (!available[availableIn]) {
        available[availableIn] = {
          amount: 0,
          transactions: [],
        };
      }
      available[availableIn].amount += balance.categories[id].amount;
      available[availableIn].transactions = available[
        availableIn
      ].transactions.concat(balance.categories[id].transactions);
    }
  });
}

function addBudgeted(
  toBudget: number,
  available: AmountWithPartialTransactions = {
    amount: 0,
    transactions: [],
  },
): AmountWithPartialTransactions {
  if (toBudget === 0) {
    return available;
  }
  return {
    amount: available.amount + toBudget,
    transactions: [
      {
        amount: toBudget,
        name: `${toBudget > 0 ? 'Not budgeted' : 'Overbudgeted'} last month`,
      },
      ...available.transactions,
    ],
  };
}

type GetLastEntryArgs = {
  entry: BudgetListEntry;
  rollover: Rollover;
  trees: CategoryTree[];
  round: (value: number) => number;
  overspendRolloverState: OverspendRollover;
};
function getLastEntry({
  entry,
  rollover,
  trees,
  round,
  overspendRolloverState,
}: GetLastEntryArgs) {
  const total = emptyBudgetRow();
  const { total: _, ...rolloverCategories } = rollover;
  const budgetCategories = getCategoryRows({
    overspendRolloverState,
    trees,
    round,
    rolloverCategories,
    rollover,
    parentRows: [total],
  });

  return {
    total: total,
    available: addBudgeted(entry.toBudget),
    overspendPrevMonth: 0,
    uncategorized: { amount: 0, transactions: [] },
    toBudget: entry.toBudget,
    categories: budgetCategories,
  };
}

export default function useBudgets(
  transactions: Transaction[] = EMPTY_TRANSACTIONS,
  categories: CategoryTree[] = [],
  {
    budgets,
    settings: { incomeCategories, fractionDigits, startBalance },
  }: BudgetState,
) {
  const round = useMemo(() => roundWithFractions(fractionDigits), [
    fractionDigits,
  ]);
  const balances = useMemo(() => calculateBalances(transactions), [
    transactions,
  ]);

  const [first, last, lastDate] = useFirstLast(balances, budgets);
  const pastBudget = useMemo(
    () => ({
      ...EMPTY_BUDGET,
      available: {
        amount: startBalance,
        transactions: [],
      },
      toBudget: startBalance,
    }),
    [startBalance],
  );
  return useMemo((): [
    BudgetList,
    BudgetListEntry,
    BudgetListEntry,
    Date | undefined,
  ] => {
    if (!first || !last || !lastDate) {
      return [EMPTY_BUDGETS, EMPTY_BUDGET, EMPTY_BUDGET, lastDate];
    }
    const budgetList: BudgetList = {};
    const available: AmountWithPartialTransactions[] = [
      {
        amount: startBalance,
        transactions: [],
      },
    ];
    let rollover: Rollover = { total: 0 };
    const overspendRolloverState: OverspendRollover = {};
    let toBudget: number = 0;
    let current: string = first;
    while (true) {
      const { total: overspendPrevMonth, ...rolloverCategories } = rollover;
      rollover = { total: 0 };
      const balance = balances[current];
      const budget = budgets[current];
      if (balance) {
        assignAvailable(incomeCategories, available, balance);
      }
      const availableThisMonth = addBudgeted(toBudget, available.shift());

      const total = emptyBudgetRow();
      const budgetCategories = getCategoryRows({
        overspendRolloverState,
        trees: categories,
        balance,
        budget,
        round,
        rolloverCategories,
        rollover,
        parentRows: [total],
      });

      const uncategorized = (balance && balance.uncategorised) || {
        amount: 0,
        transactions: [],
      };
      toBudget =
        availableThisMonth.amount -
        total.budgeted +
        overspendPrevMonth +
        uncategorized.amount;

      budgetList[current] = {
        total,
        available: availableThisMonth,
        overspendPrevMonth,
        toBudget,
        categories: budgetCategories,
        uncategorized,
      };

      const nextMonth = addMonths(new Date(current), 1);
      if (
        isAfter(nextMonth, lastDate) &&
        !available.length &&
        rollover.total === 0
      ) {
        break;
      }
      current = formatDateKey(nextMonth);
    }

    return [
      budgetList,
      getLastEntry({
        overspendRolloverState,
        entry: budgetList[current]!,
        rollover,
        trees: categories,
        round,
      }),
      pastBudget,
      lastDate,
    ];
  }, [
    first,
    last,
    lastDate,
    balances,
    round,
    categories,
    budgets,
    incomeCategories,
    startBalance,
    pastBudget,
  ]);
}
