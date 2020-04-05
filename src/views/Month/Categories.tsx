import React, { Fragment, useCallback } from 'react';
import classNames from 'classnames';
import { isCategory } from '../../moneymoney';
import { BudgetCategoryRow } from '../../budget/useBudgets';
import { Row } from '../../components';
import { Props } from './Types';
import styles from './Month.module.scss';
import { NumberFormatter, Menu, MenuItem } from '../../lib';
import { ActionCreators } from './useActions';
import BudgetInput from './BudgetInput';

type CategoriesProps = Omit<Props, 'budget'> & {
  budgetCategories?: BudgetCategoryRow[];
  indent?: number;
  actions: ActionCreators;
};

type BudgetRowProps = {
  actions: CategoriesProps['actions'];
  numberFormatter: NumberFormatter;
  budgetCategory?: BudgetCategoryRow;
  categoryId?: number;
  indent: number;
};
function noop() {}
function BudgetRow({
  numberFormatter,
  budgetCategory,
  actions: { setBudgeted, toggleRollover },
  indent,
  categoryId,
}: BudgetRowProps) {
  const { format } = numberFormatter;
  const budgeted = budgetCategory ? budgetCategory.budgeted : 0;
  const rollover = budgetCategory ? budgetCategory.overspendRollover : false;
  const spend = budgetCategory ? budgetCategory.spend : 0;
  const balance = budgetCategory ? budgetCategory.balance : 0;
  const isLeaf = categoryId !== undefined;
  const showContextMenu = useCallback(
    (ev) => {
      if (!categoryId) {
        return;
      }
      ev.preventDefault();
      const menu = new Menu();
      menu.append(
        new MenuItem({
          label: rollover
            ? 'Stop overspending rollover'
            : 'Rollover overspending',
          click() {
            toggleRollover({ id: categoryId, rollover: !rollover });
          },
        }),
      );
      menu.popup();
    },
    [categoryId, toggleRollover, rollover],
  );

  return (
    <Row
      className={classNames(
        styles.budgetRow,
        categoryId === undefined && styles.budgetRowGroup,
      )}
      indent={indent}
      leaf={isLeaf}
    >
      <span className={classNames(budgeted === 0 && styles.zero)}>
        {categoryId !== undefined ? (
          <BudgetInput
            onChange={setBudgeted}
            value={budgeted}
            categoryId={categoryId}
            numberFormatter={numberFormatter}
          />
        ) : (
          format(budgeted)
        )}
      </span>
      <span className={classNames(spend === 0 && styles.zero)}>
        {format(spend)}
      </span>
      <span
        onContextMenu={isLeaf ? showContextMenu : noop}
        className={classNames(
          balance === 0 && styles.zero,
          balance < 0 && styles.negativeBalance,
        )}
      >
        {format(balance)}
      </span>
    </Row>
  );
}

export default function Categories({
  categories,
  budgetCategories = [],
  indent = 0,
  ...rest
}: CategoriesProps) {
  const { numberFormatter, actions } = rest;
  return (
    <>
      {categories.map((tree) => {
        if (isCategory(tree)) {
          return (
            <BudgetRow
              key={tree.id}
              indent={indent}
              actions={actions}
              budgetCategory={budgetCategories.find(({ id }) => id === tree.id)}
              numberFormatter={numberFormatter}
              categoryId={tree.id}
            />
          );
        }

        const budgetCategory = budgetCategories.find(
          ({ name }) => name === tree.name,
        );

        return (
          <Fragment key={tree.name}>
            <BudgetRow
              indent={indent}
              actions={actions}
              budgetCategory={budgetCategory}
              numberFormatter={numberFormatter}
            />
            <Categories
              indent={indent + 1}
              categories={tree.children}
              budgetCategories={
                budgetCategory ? budgetCategory.children : undefined
              }
              {...rest}
            />
          </Fragment>
        );
      })}
    </>
  );
}
