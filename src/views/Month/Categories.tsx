import React, { Fragment } from 'react';
import { isCategory } from '../../moneymoney';
import { BudgetCategoryRow } from '../../budget/useBudgets';
import { Props } from './Types';
import styles from './Month.module.scss';

type CategoriesProps = Omit<Props, 'budget'> & {
  budgetCategories?: BudgetCategoryRow[];
  setBudgeted: (budget: { id: number; amount: number }) => void;
};

export default function Categories({
  categories,
  budgetCategories = [],
  ...rest
}: CategoriesProps) {
  const {
    numberFormatter: { format },
  } = rest;
  return (
    <>
      {categories.map((tree) => {
        if (isCategory(tree)) {
          const budgetCategory = budgetCategories.find(
            ({ id }) => id === tree.id,
          );
          return (
            <div className={styles.budgetRow} key={tree.id}>
              {!budgetCategory ? (
                <>HELLO</>
              ) : (
                <>
                  <span>{format(budgetCategory.budgeted)}</span>
                  <span>{format(budgetCategory.spend)}</span>
                  <span>{format(budgetCategory.balance)}</span>
                </>
              )}
            </div>
          );
        }

        const budgetCategory = budgetCategories.find(
          ({ name }) => name === tree.name,
        );

        console.log(tree, budgetCategory);
        return (
          <Fragment key={tree.name}>
            <div className={styles.budgetRow}>
              {!budgetCategory ? (
                <>HELLO</>
              ) : (
                <>
                  <span>{format(budgetCategory.budgeted)}</span>
                  <span>{format(budgetCategory.spend)}</span>
                  <span>{format(budgetCategory.balance)}</span>
                </>
              )}
            </div>
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
