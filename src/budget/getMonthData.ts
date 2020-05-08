import { format } from 'date-fns/esm';
import memoize from 'memoize-one';
import { Balance, Category } from '../moneymoney';
import {
  Budget,
  IncomeCategory,
  AmountWithPartialTransactions,
  BudgetRow,
  OverspendRollover,
  Rollover,
  BudgetCategoryGroup,
  BudgetCategoryRow,
  MonthDataGetter,
  InterMonthData,
  MonthData,
} from './Types';

function assignAvailable(
  incomeCategories: IncomeCategory[],
  prevAvailable: AmountWithPartialTransactions[],
  balance?: Balance,
) {
  const available = prevAvailable.map(({ amount, transactions }) => ({
    amount,
    transactions: [...transactions],
  }));
  if (!balance) {
    return available;
  }
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
  return available;
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

function emptyBudgetRow(): BudgetRow {
  return { budgeted: 0, spend: 0, balance: 0 };
}

type GetCategoryRowsArgs = {
  overspendRolloverState: OverspendRollover;
  categories: Category[];
  balance?: Balance;
  budget?: Budget;
  round: (value: number) => number;
  rolloverCategories: Omit<Rollover, 'total'>;
};
function getCategoryRows({
  overspendRolloverState,
  categories,
  balance,
  budget,
  round,
  rolloverCategories,
}: GetCategoryRowsArgs): {
  rollover: Rollover;
  categories: (BudgetCategoryGroup | BudgetCategoryRow)[];
  total: BudgetRow;
  overspendRolloverState: OverspendRollover;
} {
  const parentRows: BudgetRow[] = [emptyBudgetRow()];
  const newOverspendRolloverState: OverspendRollover = {};
  const rollover: Rollover = { total: 0 };

  const cats = categories.map(({ group, uuid, indentation }):
    | BudgetCategoryGroup
    | BudgetCategoryRow => {
    parentRows.splice(indentation + 1);
    if (group) {
      const row = {
        ...emptyBudgetRow(),
        uuid,
        group: true as const,
        indentation,
      };
      parentRows[indentation + 1] = row;
      return row;
    } else {
      const budgetCat = (budget && budget.categories[uuid]) || {
        amount: 0,
      };
      const budgeted = budgetCat.amount || 0;
      const spend = (balance && balance.categories[uuid]) || {
        amount: 0,
        transactions: [],
      };

      const overspendRolloverSetting = budgetCat.rollover;
      const overspendRollover =
        overspendRolloverSetting !== undefined
          ? overspendRolloverSetting
          : overspendRolloverState[uuid] || false;
      newOverspendRolloverState[uuid] = overspendRollover;

      const budgetCategoryBalance = round(
        budgeted + spend.amount + (rolloverCategories[uuid] || 0),
      );
      parentRows.forEach((row) => {
        row.budgeted = round(row.budgeted + budgeted);
        row.spend = round(row.spend + spend.amount);
        row.balance = round(row.balance + budgetCategoryBalance);
      });

      if (budgetCategoryBalance > 0 || overspendRollover) {
        rollover[uuid] = budgetCategoryBalance;
      } else if (budgetCategoryBalance < 0) {
        rollover.total += budgetCategoryBalance;
      }

      return {
        indentation,
        overspendRollover,
        group: false as const,
        budgeted: round(budgeted),
        spend: round(spend.amount),
        balance: budgetCategoryBalance,
        transactions: spend.transactions,
        uuid,
      };
    }
  });

  return {
    rollover,
    categories: cats,
    total: parentRows[0],
    overspendRolloverState: newOverspendRolloverState,
  };
}

const calcMonth: MonthDataGetter<InterMonthData> = function calcMonth(
  getPrev,
  balance,
  budget,
  categories,
  incomeCategories,
  round,
) {
  const {
    overspendRolloverState: prevOverspendRolloverState,
    toBudget: prevToBudget,
    available: prevAvailable,
    rollover: { total: overspendPrevMonth, ...rolloverCategories },
  } = getPrev();
  const available = assignAvailable(incomeCategories, prevAvailable, balance);
  const availableThisMonth = addBudgeted(prevToBudget, available.shift());
  const {
    rollover,
    categories: budgetCategories,
    total,
    overspendRolloverState,
  } = getCategoryRows({
    overspendRolloverState: prevOverspendRolloverState,
    categories,
    balance,
    budget,
    round,
    rolloverCategories,
  });
  const uncategorized = (balance && balance.uncategorised) || {
    amount: 0,
    transactions: [],
  };
  const toBudget = round(
    availableThisMonth.amount -
      total.budgeted +
      overspendPrevMonth +
      uncategorized.amount,
  );

  return {
    overspendRolloverState,
    toBudget,
    total,
    available,
    rollover,
    overspendPrevMonth,
    categories: budgetCategories,
    uncategorized,
  };
};

const cache: { [key: string]: MonthDataGetter<MonthData> } = {};
export default function getMonthData(key: string): MonthDataGetter<MonthData> {
  if (!cache[key]) {
    const date = new Date(key);
    cache[key] = memoize((...args) => ({
      key,
      date,
      name: format(date, 'MMMM'),
      get: memoize(calcMonth as any).bind(null, ...args),
    }));
  }
  return cache[key];
}
