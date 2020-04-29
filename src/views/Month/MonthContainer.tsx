import React, { useRef, useEffect, useState } from 'react';
import { useIsVisible, useSetVisibleMonth } from '../../lib';
import Header from './Header';
import Overview from './Overview';
import Categories from './Categories';
import { Props } from './Types';
import styles from './Month.module.scss';
import useActions from './useActions';

export default function MonthContainer(props: Props) {
  const { date, month, numberFormatter } = props;
  const isVisible = useIsVisible();
  const setVisibleMonth = useSetVisibleMonth();
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => isVisible(ref.current!, setVisible), [isVisible]);
  useEffect(() => (visible ? setVisibleMonth(date) : undefined), [
    date,
    visible,
    setVisibleMonth,
  ]);
  const actions = useActions(props);
  const data = visible ? month.get() : undefined;

  return (
    <div className={styles.month}>
      <div ref={ref} className={styles.monthInner}>
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
            actions={actions}
          />
        ) : null}
      </div>
    </div>
  );
}
