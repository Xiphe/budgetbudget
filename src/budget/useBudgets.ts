import { useMemo } from 'react';
import addMonths from 'date-fns/addMonths';
import isAfter from 'date-fns/isAfter';
import { BudgetState, Budgets, Budget, IncomeCategory } from './Types';
import {
  Balances,
  CategoryTree,
  Transaction,
  Currency,
  Balance,
  isCategory,
} from '../moneymoney/Types';
import { formatDateKey, roundWithFractions } from '../lib';
import { calculateBalances } from '../moneymoney';

export type BudgetRow = { budgeted: number; spend: number; balance: number };
export type BudgetCategoryRow = BudgetRow & {
  name: string;
  id?: number;
  transactions?: Transaction[];
  children?: BudgetCategoryRow[];
};
export type BudgetListEntry = {
  available: AmountWithPartialTransactions;
  overspendPrevMonth: number;
  budgeted: number;
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
  budgeted: 0,
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
    const sorted = Object.keys(balances)
      .concat(Object.keys(budgets))
      .sort();
    const last = sorted[sorted.length - 1];
    return [sorted[0], last, last ? new Date(last) : undefined];
  }, [balances, budgets]);
}

type Rollover = { total: number; [key: number]: number };

type GetCategoryRowsArgs = {
  trees: CategoryTree[];
  balance?: Balance;
  budget?: Budget;
  round: (value: number) => number;
  rolloverCategories: Omit<Rollover, 'total'>;
  rollover: Rollover;
  parentRows: BudgetRow[];
};
function getCategoryRows({
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
        const budgeted = (
          (budget && budget.categories[tree.id]) || {
            amount: 0,
          }
        ).amount;
        const spend = (balance && balance.categories[tree.id]) || {
          amount: 0,
          transactions: [],
        };

        const budgetCategoryBalance = round(
          budgeted + spend.amount + (rolloverCategories[tree.id] || 0),
        );
        parentRows.forEach((row) => {
          row.budgeted = round(row.budgeted + budgeted);
          row.spend = round(row.spend + spend.amount);
          row.balance = round(row.balance + budgetCategoryBalance);
        });

        if (budgetCategoryBalance > 0) {
          rollover[tree.id] = budgetCategoryBalance;
        } else if (budgetCategoryBalance < 0) {
          rollover.total += budgetCategoryBalance;
        }

        return {
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
  budgeted: number,
  currency: string,
  available: AmountWithPartialTransactions = {
    amount: 0,
    transactions: [],
  },
): AmountWithPartialTransactions {
  if (budgeted === 0) {
    return available;
  }
  return {
    amount: available.amount + budgeted,
    transactions: [
      {
        amount: [budgeted, currency],
        name: `${budgeted > 0 ? 'Not budgeted' : 'Overbudgeted'} last month`,
      },
      ...available.transactions,
    ],
  };
}

type GetLastEntryArgs = {
  entry: BudgetListEntry;
  currency: string;
  rollover: Rollover;
  trees: CategoryTree[];
  round: (value: number) => number;
};
function getLastEntry({
  entry,
  currency,
  rollover,
  trees,
  round,
}: GetLastEntryArgs) {
  const total = emptyBudgetRow();
  const { total: _, ...rolloverCategories } = rollover;
  const budgetCategories = getCategoryRows({
    trees,
    round,
    rolloverCategories,
    rollover,
    parentRows: [total],
  });

  return {
    total: total,
    available: addBudgeted(entry.budgeted, currency),
    overspendPrevMonth: 0,
    uncategorized: { amount: 0, transactions: [] },
    budgeted: entry.budgeted,
    categories: budgetCategories,
  };
}

export default function useBudgets(
  transactions: Transaction[] = EMPTY_TRANSACTIONS,
  categories: CategoryTree[] = [],
  {
    budgets,
    startAmount,
    settings: { incomeCategories, fractionDigits },
  }: BudgetState,
  currency: Currency,
) {
  const round = useMemo(() => roundWithFractions(fractionDigits), [
    fractionDigits,
  ]);
  const startAmountInCurrency = useMemo<number>(
    () => ((startAmount || []).find(([_, c]) => c === currency) || [])[0] || 0,
    [startAmount, currency],
  );
  const balances = useMemo(() => calculateBalances(transactions, currency), [
    transactions,
    currency,
  ]);
  const budgetsForCurrency = useMemo<Budgets>(() => budgets[currency] || {}, [
    budgets,
    currency,
  ]);
  const [first, last, lastDate] = useFirstLast(balances, budgetsForCurrency);

  return useMemo((): [BudgetList, BudgetListEntry, Date | undefined] => {
    if (!first || !last || !lastDate) {
      return [EMPTY_BUDGETS, EMPTY_BUDGET, lastDate];
    }
    const budgetList: BudgetList = {};
    const available: AmountWithPartialTransactions[] = [
      {
        amount: startAmountInCurrency,
        transactions: [],
      },
    ];
    let rollover: Rollover = { total: 0 };
    let budgeted: number = 0;
    let current: string = first;
    while (true) {
      const { total: overspendPrevMonth, ...rolloverCategories } = rollover;
      rollover = { total: 0 };
      const balance = balances[current];
      const budget = budgetsForCurrency[current];
      if (balance) {
        assignAvailable(incomeCategories, available, balance);
      }
      const availableThisMonth = addBudgeted(
        budgeted,
        currency,
        available.shift(),
      );

      const total = emptyBudgetRow();
      const budgetCategories = getCategoryRows({
        trees: categories,
        balance,
        budget,
        round,
        rolloverCategories,
        rollover,
        parentRows: [total],
      });

      budgeted =
        availableThisMonth.amount - total.budgeted + overspendPrevMonth;

      budgetList[current] = {
        total,
        available: availableThisMonth,
        overspendPrevMonth,
        budgeted,
        categories: budgetCategories,
        uncategorized: (balance && balance.uncategorised) || {
          amount: 0,
          transactions: [],
        },
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
        entry: budgetList[current]!,
        currency,
        rollover,
        trees: categories,
        round,
      }),
      lastDate,
    ];
  }, [
    first,
    last,
    lastDate,
    balances,
    round,
    categories,
    currency,
    budgetsForCurrency,
    incomeCategories,
    startAmountInCurrency,
  ]);
}
