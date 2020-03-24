import React, { Dispatch, Fragment, useState } from 'react';
import { BudgetState } from './Types';
import { Action } from './budgetReducer';
import { useTransactions } from '../moneymoney';
import { Loading } from '../components';
import useBudgets, { BudgetCategoryRow } from './useBudgets';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import addMonths from 'date-fns/addMonths';
import { formatDateKey } from '../lib';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

type CategoriesProps = {
  rows: BudgetCategoryRow[];
  indent?: number;
};
function Categories({ rows, indent = 0 }: CategoriesProps) {
  return (
    <>
      {rows.map(({ id, name, children, balance, budgeted, spend }) => {
        return (
          <Fragment key={`${id || ''}_${name}`}>
            <tr>
              <td style={{ paddingLeft: `${indent * 5}px` }}>{name}</td>
              <td>{budgeted}</td>
              <td>{spend}</td>
              <td>{balance}</td>
            </tr>
            {children && <Categories rows={children} indent={indent + 1} />}
          </Fragment>
        );
      })}
    </>
  );
}

export default function Months({ state, dispatch }: Props) {
  const [month, setMonth] = useState<Date>(new Date());
  const [transactions, retry] = useTransactions(state.settings.accounts);
  // console.time('useBudgets');
  const budgets = useBudgets(
    !transactions || transactions instanceof Error ? undefined : transactions,
    state,
    'EUR',
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
      <ul>
        <li>Available Funds: {budget.available.amount}</li>
        <li>Overspend in {format(subMonths(month, 1), 'MMM')}: TODO</li>
        <li>Budgeted: {budget.total.budgeted}</li>
      </ul>
      <h3>To Budget: {budget.available.amount - budget.total.budgeted}</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Budgeted: {budget.total.budgeted}</th>
            <th>Spend: {budget.total.spend}</th>
            <th>Balance: {budget.total.balance}</th>
          </tr>
        </thead>
        <tbody>
          <Categories rows={budget.categories} />
        </tbody>
      </table>
    </>
  );
}
