import React, { useMemo } from 'react';
import classNames from 'classnames';
import { remote } from 'electron';
import { BudgetCategoryRow, BudgetCategoryGroup } from '../../budget';
import { Row } from '../../components';
import { Props } from './Types';
import styles from './Month.module.scss';
import { NumberFormatter, mapCategories } from '../../lib';
import { ActionCreators } from './useActions';
import BudgetInput from './BudgetInput';

type CategoriesProps = Omit<Props, 'budget'> &
  Partial<ActionCreators> & {
    budgetCategories?: (BudgetCategoryRow | BudgetCategoryGroup)[];
  };

type BudgetRowProps = BudgetCategoryRow &
  Partial<ActionCreators> & {
    numberFormatter: NumberFormatter;
    groupClosed: boolean;
    odd: boolean;
  };
function BudgetRow({
  numberFormatter,
  groupClosed,
  name,
  odd,
  uuid,
  overspendRollover,
  budgeted,
  spend,
  balance,
  setBudgeted,
  toggleRollover,
  indentation,
}: BudgetRowProps) {
  const { format } = numberFormatter;

  const showContextMenu = useMemo(() => {
    if (!toggleRollover) {
      return undefined;
    }

    return (ev: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
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
    };
  }, [uuid, overspendRollover, toggleRollover]);

  return (
    <Row
      odd={odd}
      className={styles.budgetRow}
      indent={indentation}
      leaf={true}
      aria-label={name}
      groupClosed={groupClosed}
    >
      <span
        role="gridcell"
        aria-label="budgeted"
        className={classNames(budgeted === 0 && styles.zero)}
      >
        {setBudgeted ? (
          <BudgetInput
            onChange={setBudgeted}
            value={budgeted}
            categoryId={uuid}
            numberFormatter={numberFormatter}
          />
        ) : (
          format(budgeted)
        )}
      </span>
      <span
        role="gridcell"
        aria-label="spend"
        className={classNames(spend === 0 && styles.zero)}
      >
        {format(spend)}
      </span>
      <span
        role="gridcell"
        aria-label="balance"
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
  setBudgeted,
  toggleRollover,
  collapsedCategories = [],
}: CategoriesProps) {
  const { format } = numberFormatter;
  return (
    <div role="grid">
      {mapCategories(
        budgetCategories,
        collapsedCategories,
        (entry, i, groupClosed) => {
          if (entry.group) {
            const { uuid, indentation, budgeted, spend, balance, name } = entry;
            return (
              <Row
                odd={!(i % 2)}
                role="rowheader"
                aria-label={name}
                key={uuid}
                className={classNames(styles.budgetRow, styles.budgetRowGroup)}
                indent={indentation}
                groupClosed={groupClosed}
              >
                <span
                  role="columnheader"
                  aria-label="budgeted"
                  className={classNames(budgeted === 0 && styles.zero)}
                >
                  {format(budgeted)}
                </span>
                <span
                  role="columnheader"
                  aria-label="spend"
                  className={classNames(spend === 0 && styles.zero)}
                >
                  {format(spend)}
                </span>
                <span
                  role="columnheader"
                  aria-label="balance"
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

          return (
            <BudgetRow
              {...entry}
              key={entry.uuid}
              setBudgeted={setBudgeted}
              toggleRollover={toggleRollover}
              odd={!(i % 2)}
              groupClosed={groupClosed}
              numberFormatter={numberFormatter}
            />
          );
        },
      )}
    </div>
  );
}
