import React, { Dispatch, useState } from 'react';
import { BudgetState } from './Types';
import { Action } from './budgetReducer';
import { useTransactions } from '../moneymoney';
import { Loading } from '../components';
import useBudgets from './useBudgets';
import Month from './Month';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import addMonths from 'date-fns/addMonths';
import { formatDateKey } from '../lib';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Months({ state, dispatch }: Props) {
  const currency = 'EUR';
  const [month, setMonth] = useState<Date>(new Date());
  const [transactions, retry] = useTransactions(state.settings.accounts);
  // console.time('useBudgets');
  const budgets = useBudgets(
    !transactions || transactions instanceof Error ? undefined : transactions,
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
        settings={state.settings}
        month={month}
        budget={budget}
        dispatch={dispatch}
        currency={currency}
      />
    </>
  );
}
