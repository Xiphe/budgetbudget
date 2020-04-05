import React, { Fragment } from 'react';
import classNames from 'classnames';
import { isCategory } from '../../moneymoney';
import { BudgetCategoryRow } from '../../budget/useBudgets';
import { Row } from '../../components';
import { Props } from './Types';
import styles from './Month.module.scss';
import { NumberFormatter } from '../../lib';
import BudgetInput from './BudgetInput';

type CategoriesProps = Omit<Props, 'budget'> & {
  budgetCategories?: BudgetCategoryRow[];
  indent?: number;
  setBudgeted: (budget: { id: number; amount: number }) => void;
};

type BudgetRowProps = {
  setBudgeted?: CategoriesProps['setBudgeted'];
  numberFormatter: NumberFormatter;
  budgetCategory?: BudgetCategoryRow;
  categoryId?: number;
  indent: number;
};

function BudgetRow({
  numberFormatter,
  budgetCategory,
  setBudgeted,
  indent,
  categoryId,
}: BudgetRowProps) {
  const { format } = numberFormatter;
  return (
    <Row
      className={classNames(
        styles.budgetRow,
        categoryId === undefined && styles.budgetRowGroup,
      )}
      indent={indent}
      leaf={categoryId !== undefined}
    >
      {!budgetCategory ? (
        <>
          <span className={styles.zero}>{format(0)}</span>
          <span className={styles.zero}>{format(0)}</span>
          <span className={styles.zero}>{format(0)}</span>
        </>
      ) : (
        <>
          <span
            className={classNames(budgetCategory.budgeted === 0 && styles.zero)}
          >
            {setBudgeted && categoryId !== undefined ? (
              <BudgetInput
                onChange={setBudgeted}
                value={budgetCategory.budgeted}
                categoryId={categoryId}
                numberFormatter={numberFormatter}
              />
            ) : (
              format(budgetCategory.budgeted)
            )}
          </span>
          <span
            className={classNames(budgetCategory.spend === 0 && styles.zero)}
          >
            {format(budgetCategory.spend)}
          </span>
          <span
            className={classNames(
              budgetCategory.balance === 0 && styles.zero,
              budgetCategory.balance < 0 && styles.negativeBalance,
            )}
          >
            {format(budgetCategory.balance)}
          </span>
        </>
      )}
    </Row>
  );
}

export default function Categories({
  categories,
  budgetCategories = [],
  indent = 0,
  ...rest
}: CategoriesProps) {
  const { numberFormatter, setBudgeted } = rest;
  return (
    <>
      {categories.map((tree) => {
        if (isCategory(tree)) {
          return (
            <BudgetRow
              key={tree.id}
              indent={indent}
              setBudgeted={setBudgeted}
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
