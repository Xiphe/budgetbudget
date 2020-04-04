import React, { Fragment } from 'react';
import { isCategory } from '../../moneymoney';
import { BudgetCategoryRow } from '../../budget/useBudgets';
import { Props } from './Types';
import styles from './Month.module.scss';
import { NumberFormatter } from '../../lib';
import BudgetInput from './BudgetInput';

type CategoriesProps = Omit<Props, 'budget'> & {
  budgetCategories?: BudgetCategoryRow[];
  setBudgeted: (budget: { id: number; amount: number }) => void;
};

type BudgetRowProps = {
  setBudgeted?: CategoriesProps['setBudgeted'];
  numberFormatter: NumberFormatter;
  budgetCategory?: BudgetCategoryRow;
  categoryId?: number;
};

function BudgetRow({
  numberFormatter,
  budgetCategory,
  setBudgeted,
  categoryId,
}: BudgetRowProps) {
  const { format } = numberFormatter;
  return (
    <div className={styles.budgetRow}>
      {!budgetCategory ? (
        <>
          <span>{format(0)}</span>
          <span>{format(0)}</span>
          <span>{format(0)}</span>
        </>
      ) : (
        <>
          <span>
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
          <span>{format(budgetCategory.spend)}</span>
          <span>{format(budgetCategory.balance)}</span>
        </>
      )}
    </div>
  );
}

export default function Categories({
  categories,
  budgetCategories = [],
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
              budgetCategory={budgetCategory}
              numberFormatter={numberFormatter}
            />
            <Categories
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
