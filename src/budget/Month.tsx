import React, { useCallback, Dispatch } from 'react';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import { Action, ACTION_SET_CATEGORY_VALUE } from './budgetReducer';
import { BudgetListEntry } from './useBudgets';
import Categories from './Categories';
import { Settings } from './Types';
import { formatDateKey, useRound } from '../lib';

type Props = {
  budget: BudgetListEntry;
  month: Date;
  currency: string;
  settings: Settings;
  dispatch: Dispatch<Action>;
};
const normalizeVal = (value: string) => (value.length ? parseFloat(value) : 0);
export default function Month({
  budget,
  month,
  dispatch,
  currency,
  settings: { accuracy },
}: Props) {
  const round = useRound(accuracy, normalizeVal);
  const setBudgeted = useCallback<
    (ev: React.ChangeEvent<HTMLInputElement>) => void
  >(
    (ev) => {
      dispatch({
        type: ACTION_SET_CATEGORY_VALUE,
        payload: {
          currency,
          amount: normalizeVal(ev.target.value),
          monthKey: formatDateKey(month),
          categoryId: parseInt(ev.target.name, 10),
        },
      });
    },
    [month, dispatch, currency],
  );
  return (
    <>
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
          <Categories
            rows={budget.categories}
            onChange={setBudgeted}
            round={round}
          />
        </tbody>
      </table>
    </>
  );
}
