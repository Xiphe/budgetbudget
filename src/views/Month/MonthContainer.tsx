import React, { useRef, useEffect, useState, ReactNode } from 'react';
import cx from 'classnames';
import {
  useIsVisible,
  useSetVisibleMonth,
  MonthContextProvider,
} from '../../lib';
import Header from './Header';
import Categories from './Categories';
import { Props as BaseProps } from './Types';
import styles from './Month.module.scss';
import format from 'date-fns/format';
import useActions from './useActions';
import { InterMonthData, MonthData } from '../../budget/Types';

type Props = BaseProps & {
  initialVisible?: boolean;
  children:
    | ReactNode
    | ((data: InterMonthData | undefined, month: MonthData) => ReactNode);
  width?: 'auto' | 'full';
};

export default function MonthContainer({
  initialVisible = false,
  width = 'auto',
  children,
  ...props
}: Props) {
  const { date, month } = props;
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
            {typeof children === 'function' ? children(data, month) : children}
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
