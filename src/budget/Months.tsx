import React, { Dispatch, useState, useMemo } from 'react';
import { BudgetState } from './Types';
import { Action } from './budgetReducer';
import { useTransactions, Transaction, getCategories } from '../moneymoney';
import { Loading } from '../components';
import useBudgets from './useBudgets';
import Month from './Month';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import addMonths from 'date-fns/addMonths';
import { formatDateKey, createNumberFormatter } from '../lib';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

function transactionsLoaded(
  transactions: Transaction[] | Error | null,
): transactions is Transaction[] {
  return Array.isArray(transactions);
}

export default function Months({ state, dispatch }: Props) {
  const currency = 'EUR';
  const { fractionDigits, numberLocale, incomeCategories } = state.settings;
  const numberFormatter = useMemo(
    () => createNumberFormatter(fractionDigits, numberLocale),
    [fractionDigits, numberLocale],
  );
  const [month, setMonth] = useState<Date>(new Date());
  const [transactions, retry] = useTransactions(state.settings.accounts);
  const incomeCategoryIds = useMemo(
    () => incomeCategories.map(({ id }) => id),
    [incomeCategories],
  );
  const categories = useMemo(
    () =>
      transactionsLoaded(transactions)
        ? getCategories(transactions, incomeCategoryIds)
        : undefined,
    [transactions, incomeCategoryIds],
  );
  // console.time('useBudgets');
  const budgets = useBudgets(
    transactionsLoaded(transactions) ? transactions : undefined,
    categories,
    state,
    currency,
  );
  // console.timeEnd('useBudgets');

  if (transactions instanceof Error) {
    return (
      <div>
        <p>Error: {transactions.message}</p>
        <button onClick={retry}>retry</button>
      </div>
    );
  }

  if (!transactions) {
    return <Loading />;
  }

  const budget = budgets[formatDateKey(month)];
  if (!budget) {
    throw new Error('TODO: IMPLEMENT NEW BUDGET VIEW');
  }

  return (
    <>
      <h2>
        <button
          title="previous month"
          onClick={() => setMonth(subMonths(month, 1))}
        >
          <span role="img" aria-label="previous month">
            ◀️
          </span>
        </button>
        {format(month, 'MMM yyyy')}
        <button
          title="next month"
          onClick={() => setMonth(addMonths(month, 1))}
        >
          <span role="img" aria-label="next month">
            ▶️
          </span>
        </button>
      </h2>
      <Month
        numberFormatter={numberFormatter}
        month={month}
        budget={budget}
        dispatch={dispatch}
        currency={currency}
      />
    </>
  );
}
