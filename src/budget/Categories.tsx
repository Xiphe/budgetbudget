import React, { Fragment } from 'react';
import BudgetInput from './BudgetInput';
import { BudgetCategoryRow } from './useBudgets';

type OnChangeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => void;
type CategoriesProps = {
  rows: BudgetCategoryRow[];
  onChange: OnChangeHandler;
  round: (amount: string) => number;
  indent?: number;
};

export default function Categories({
  rows,
  onChange,
  round,
  indent = 0,
}: CategoriesProps) {
  return (
    <>
      {rows.map(({ id, name, children, balance, budgeted, spend }) => {
        return (
          <Fragment key={`${id || ''}_${name}`}>
            <tr>
              <td style={{ paddingLeft: `${indent * 5}px` }}>{name}</td>
              <td>
                {id ? (
                  <BudgetInput
                    value={budgeted}
                    round={round}
                    name={id.toString()}
                    onChange={onChange}
                  />
                ) : (
                  budgeted
                )}
              </td>
              <td>{spend}</td>
              <td>{balance}</td>
            </tr>
            {children && (
              <Categories
                rows={children}
                round={round}
                indent={indent + 1}
                onChange={onChange}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}
