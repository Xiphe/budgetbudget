import React, { useMemo, Fragment } from 'react';
import classNames from 'classnames';
import subMonths from 'date-fns/subMonths';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import { Header } from '../../components';
import { useVisibleMonths, formatDateKey } from '../../lib';
import styles from './Budget.module.scss';

type Month = {
  date: Date;
  key: string;
  loaded: boolean;
  name: string;
  year?: string;
  even: boolean;
  current: boolean;
};

type Props = {
  months: { date: Date; key: string }[];
};

export default function BudgetHeader({ months }: Props) {
  const visibleMonths = useVisibleMonths();
  const loadedMonthKeys = useMemo(() => months.map(({ key }) => key), [months]);
  const monthList = useMemo(() => {
    if (!visibleMonths.length) {
      return [];
    }
    const visibleMonthKeys = visibleMonths.map(formatDateKey);
    const monthsToDisplay = Math.max(12, visibleMonths.length + 2);
    const offsetLeft = Math.round((monthsToDisplay - visibleMonths.length) / 2);
    const list: Month[] = [];
    let current = subMonths(visibleMonths[0], offsetLeft);
    let first = true;
    while (list.length < monthsToDisplay) {
      const key = formatDateKey(current);
      list.push({
        date: current,
        key,
        loaded: loadedMonthKeys.includes(key),
        current: visibleMonthKeys.includes(key),
        name: format(current, 'MMM'),
        year:
          first || format(current, 'M') === '1'
            ? format(current, 'yyyy')
            : undefined,
        even: current.getFullYear() % 2 === 0,
      });
      first = false;
      current = addMonths(current, 1);
    }

    return list;
  }, [visibleMonths, loadedMonthKeys]);

  return (
    <Header>
      <div className={styles.monthList}>
        {monthList.map(({ key, date, name, year, even, current, loaded }) => {
          return (
            <Fragment key={key}>
              {year && (
                <span
                  className={classNames(
                    styles.monthListEntry,
                    styles.monthListEntryYear,
                    even && styles.evenMonthListEntry,
                  )}
                >
                  {year}
                </span>
              )}
              <button
                className={classNames(
                  styles.monthListEntry,
                  !loaded && styles.unloadedMonthListEntry,
                  current && styles.currentMonthListEntry,
                  even && styles.evenMonthListEntry,
                )}
              >
                {name}
              </button>
            </Fragment>
          );
        })}
      </div>
    </Header>
  );
}
