import React, { Fragment } from 'react';
import BudgetInput from './BudgetInput';
import { BudgetCategoryRow } from './useBudgets';
import { NumberFormatter } from '../lib';

type OnChangeHandler = (ev: { value: number; id: number }) => void;
type CategoriesProps = {
  rows: BudgetCategoryRow[];
  onChange: OnChangeHandler;
  numberFormatter: NumberFormatter;
  indent?: number;
};

export default function Categories({
  rows,
  onChange,
  numberFormatter,
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
                    numberFormatter={numberFormatter}
                    categoryId={id}
                    onChange={onChange}
                  />
                ) : (
                  numberFormatter.format(budgeted)
                )}
              </td>
              <td>{numberFormatter.format(spend)}</td>
              <td>{numberFormatter.format(balance)}</td>
            </tr>
            {children && (
              <Categories
                rows={children}
                numberFormatter={numberFormatter}
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
