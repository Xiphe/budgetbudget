import React, { useCallback } from 'react';
import classNames from 'classnames';
import { remote } from 'electron';
import {
  BudgetCategoryRow,
  BudgetCategoryGroup,
  isBudgetCategoryRow,
} from '../../budget';
import { Row } from '../../components';
import { Props } from './Types';
import styles from './Month.module.scss';
import { NumberFormatter } from '../../lib';
import { ActionCreators } from './useActions';
import BudgetInput from './BudgetInput';

type CategoriesProps = Omit<Props, 'budget'> & {
  budgetCategories?: (BudgetCategoryRow | BudgetCategoryGroup)[];
  actions: ActionCreators;
};

type BudgetRowProps = {
  actions: CategoriesProps['actions'];
  numberFormatter: NumberFormatter;

  entry: BudgetCategoryRow;
  indent: number;
};
function BudgetRow({
  numberFormatter,
  entry: { uuid, overspendRollover, budgeted, spend, balance },
  actions: { setBudgeted, toggleRollover },
  indent,
}: BudgetRowProps) {
  const { format } = numberFormatter;

  const showContextMenu = useCallback(
    (ev) => {
      ev.preventDefault();
      const menu = new remote.Menu();
      menu.append(
        new remote.MenuItem({
          label: overspendRollover
            ? 'Stop overspending rollover'
            : 'Rollover overspending',
          click() {
            toggleRollover({
              id: uuid,
              rollover: !overspendRollover,
            });
          },
        }),
      );
      menu.popup();
    },
    [uuid, overspendRollover, toggleRollover],
  );

  return (
    <Row className={styles.budgetRow} indent={indent} leaf={true}>
      <span className={classNames(budgeted === 0 && styles.zero)}>
        <BudgetInput
          onChange={setBudgeted}
          value={budgeted}
          categoryId={uuid}
          numberFormatter={numberFormatter}
        />
      </span>
      <span className={classNames(spend === 0 && styles.zero)}>
        {format(spend)}
      </span>
      <span
        onContextMenu={showContextMenu}
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
  budgetCategories = [],
  numberFormatter,
  actions,
}: CategoriesProps) {
  const { format } = numberFormatter;
  return (
    <>
      {budgetCategories.map((entry) => {
        if (!isBudgetCategoryRow(entry)) {
          return (
            <Row
              key={entry.uuid}
              className={classNames(styles.budgetRow, styles.budgetRowGroup)}
              indent={entry.indent}
            >
              <span className={classNames(entry.budgeted === 0 && styles.zero)}>
                {format(entry.budgeted)}
              </span>
              <span className={classNames(entry.spend === 0 && styles.zero)}>
                {format(entry.spend)}
              </span>
              <span
                className={classNames(
                  entry.balance === 0 && styles.zero,
                  entry.balance < 0 && styles.negativeBalance,
                )}
              >
                {format(entry.balance)}
              </span>
            </Row>
          );
        }

        return (
          <BudgetRow
            key={entry.uuid}
            indent={entry.indent}
            actions={actions}
            entry={entry}
            numberFormatter={numberFormatter}
          />
        );
      })}
    </>
  );
}
