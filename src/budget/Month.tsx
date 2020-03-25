import React from 'react';
import format from 'date-fns/format';
import subMonths from 'date-fns/subMonths';
import { BudgetListEntry } from './useBudgets';
import Categories from './Categories';

type Props = {
  budget: BudgetListEntry;
  month: Date;
};
export default function Month({ budget, month }: Props) {
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
          <Categories rows={budget.categories} />
        </tbody>
      </table>
    </>
  );
}
