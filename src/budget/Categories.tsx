import React, { Fragment } from 'react';
import { BudgetCategoryRow } from './useBudgets';

type CategoriesProps = {
  rows: BudgetCategoryRow[];
  indent?: number;
};
export default function Categories({ rows, indent = 0 }: CategoriesProps) {
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
