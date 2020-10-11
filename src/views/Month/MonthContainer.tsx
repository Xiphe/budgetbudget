import React, { useRef, useEffect, useState } from 'react';
import cx from 'classnames';
import {
  useIsVisible,
  useSetVisibleMonth,
  MonthContextProvider,
} from '../../lib';
import Header from './Header';
import Overview from './Overview';
import Categories from './Categories';
import { Props as BaseProps } from './Types';
import styles from './Month.module.scss';
import format from 'date-fns/format';
import useActions from './useActions';

type Props = BaseProps & {
  initialVisible?: boolean;
  width?: 'auto' | 'full';
};

export default function MonthContainer({
  initialVisible = false,
  width = 'auto',
  ...props
}: Props) {
  const { date, month, numberFormatter } = props;
  const isVisible = useIsVisible();
  const setVisibleMonth = useSetVisibleMonth();
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(initialVisible);
  useEffect(() => isVisible?.(ref.current!, setVisible), [isVisible]);
  useEffect(() => (visible ? setVisibleMonth?.(date) : undefined), [
    date,
    visible,
    setVisibleMonth,
  ]);
  const actions = useActions({ dispatch: props.dispatch, monthKey: month.key });
  const data = visible ? month.get() : undefined;

  return (
    <MonthContextProvider value={month}>
      <div
        className={cx(styles.month, width === 'full' && styles.monthWidthFull)}
      >
        <section
          ref={ref}
          className={styles.monthInner}
          aria-label={format(date, 'MMMM yyyy')}
        >
          <Header>
            <Overview
              month={month}
              data={data}
              numberFormatter={numberFormatter}
            />
          </Header>
          {data ? (
            <Categories
              {...props}
              budgetCategories={data.categories}
              setBudgeted={actions?.setBudgeted}
              toggleRollover={actions?.toggleRollover}
            />
          ) : null}
        </section>
      </div>
    </MonthContextProvider>
  );
}
