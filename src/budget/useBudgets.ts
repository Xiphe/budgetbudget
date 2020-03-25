import { useMemo } from 'react';
import addMonths from 'date-fns/addMonths';
import isAfter from 'date-fns/isAfter';
import { BudgetState, Budgets, Budget, IncomeCategory } from './Types';
import {
  Balances,
  CategoryTree,
  Transaction,
  Currency,
  AmountWithTransactions,
  Balance,
  isCategory,
} from '../moneymoney/Types';
import { formatDateKey, roundWithFractions } from '../lib';
import { getCategories, calculateBalances } from '../moneymoney';

export type BudgetRow = { budgeted: number; spend: number; balance: number };
export type BudgetCategoryRow = BudgetRow & {
  name: string;
  id?: number;
  transactions?: Transaction[];
  children?: BudgetCategoryRow[];
};
export type BudgetListEntry = {
  available: AmountWithTransactions;
  total: BudgetRow;
  uncategorized: AmountWithTransactions;
  categories: BudgetCategoryRow[];
};
type BudgetList = {
  [key: string]: undefined | BudgetListEntry;
};

const EMPTY_TRANSACTIONS: Transaction[] = [];
const EMPTY_BUDGETS: BudgetList = {};

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

function getCategoryRows(
  trees: CategoryTree[],
  balance: undefined | Balance,
  budget: undefined | Budget,
  ignoreCategories: number[],
  round: (value: number) => number,
  parentRows: BudgetRow[],
): BudgetCategoryRow[] {
  return trees
    .map((tree): BudgetCategoryRow | null => {
      if (!isCategory(tree)) {
        const row = emptyBudgetRow();
        const children = getCategoryRows(
          tree.children,
          balance,
          budget,
          ignoreCategories,
          round,
          parentRows.concat(row),
        );
        if (!children.length) {
          return null;
        }

        return {
          ...row,
          name: tree.name,
          children,
        };
      } else if (ignoreCategories.includes(tree.id)) {
        return null;
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
        parentRows.forEach((row) => {
          row.budgeted = round(row.budgeted + budgeted);
          row.spend = round(row.spend + spend.amount);
          row.balance = round(row.budgeted + row.spend);
        });
        return {
          budgeted: round(budgeted),
          spend: round(spend.amount),
          balance: round(budgeted + spend.amount),
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
  available: AmountWithTransactions[],
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

export default function useBudgets(
  transactions: Transaction[] = EMPTY_TRANSACTIONS,
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
  const categories = useMemo(() => getCategories(transactions), [transactions]);
  const startAmountInCurrency = useMemo<number>(
    () => ((startAmount || []).find(([_, c]) => c === currency) || [])[0] || 0,
    [startAmount, currency],
  );
  const incomeCategoryIds = useMemo(
    () => incomeCategories.map(({ id }) => id),
    [incomeCategories],
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

  return useMemo(() => {
    if (!first || !last || !lastDate) {
      return EMPTY_BUDGETS;
    }
    const budgetList: BudgetList = {};
    const available: AmountWithTransactions[] = [
      {
        amount: startAmountInCurrency,
        transactions: [],
      },
    ];
    let current: string = first;
    while (true) {
      const balance = balances[current];
      const budget = budgetsForCurrency[current];
      if (balance) {
        assignAvailable(incomeCategories, available, balance);
      }
      const availableThisMonth = available.splice(0, 1)[0] || {
        amount: 0,
        transactions: [],
      };
      const total = emptyBudgetRow();

      budgetList[current] = {
        total,
        available: availableThisMonth,
        categories: getCategoryRows(
          categories,
          balance,
          budget,
          incomeCategoryIds,
          round,
          [total],
        ),
        uncategorized: (balance && balance.uncategorised) || {
          amount: 0,
          transactions: [],
        },
      };
      const nextMonth = addMonths(new Date(current), 1);
      if (isAfter(nextMonth, lastDate) && !available.length) {
        break;
      }
      current = formatDateKey(nextMonth);
    }

    return budgetList;
  }, [
    first,
    last,
    lastDate,
    balances,
    round,
    categories,
    budgetsForCurrency,
    incomeCategories,
    incomeCategoryIds,
    startAmountInCurrency,
  ]);
}
