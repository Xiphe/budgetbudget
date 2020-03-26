import React, { useCallback, Dispatch } from 'react';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import { Action, ACTION_SET_CATEGORY_VALUE } from './budgetReducer';
import { BudgetListEntry } from './useBudgets';
import Categories from './Categories';
import { formatDateKey, NumberFormatter } from '../lib';

type Props = {
  budget: BudgetListEntry;
  month: Date;
  currency: string;
  numberFormatter: NumberFormatter;
  dispatch: Dispatch<Action>;
};
export default function Month({
  budget,
  month,
  dispatch,
  currency,
  numberFormatter,
}: Props) {
  const setBudgeted = useCallback<(ev: { value: number; id: number }) => void>(
    ({ value, id }) => {
      dispatch({
        type: ACTION_SET_CATEGORY_VALUE,
        payload: {
          currency,
          amount: value,
          monthKey: formatDateKey(month),
          categoryId: id,
        },
      });
    },
    [month, dispatch, currency],
  );
  return (
    <>
      <ul>
        <li>
          Available Funds: {numberFormatter.format(budget.available.amount)}
        </li>
        <li>Overspend in {format(subMonths(month, 1), 'MMM')}: TODO</li>
        <li>Budgeted: {numberFormatter.format(budget.total.budgeted)}</li>
      </ul>
      <h3>
        To Budget:{' '}
        {numberFormatter.format(
          budget.available.amount - budget.total.budgeted,
        )}
      </h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Budgeted: {numberFormatter.format(budget.total.budgeted)}</th>
            <th>Spend: {numberFormatter.format(budget.total.spend)}</th>
            <th>Balance: {numberFormatter.format(budget.total.balance)}</th>
          </tr>
        </thead>
        <tbody>
          <Categories
            rows={budget.categories}
            onChange={setBudgeted}
            numberFormatter={numberFormatter}
          />
        </tbody>
      </table>
    </>
  );
}
