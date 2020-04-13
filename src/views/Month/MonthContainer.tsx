import React, { useRef, useEffect, useState } from 'react';
import { Loading } from '../../components';
import { useIsVisible, useSetVisibleMonth } from '../../lib';
import Header from './Header';
import Overview from './Overview';
import Categories from './Categories';
import { Props } from './Types';
import styles from './Month.module.scss';
import useActions from './useActions';

export default function MonthContainer(props: Props) {
  const { date, budget } = props;
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

  return (
    <div ref={ref} className={styles.month}>
      <div>
        <Header>{visible ? <Overview {...props} /> : <Loading />}</Header>
        {visible ? (
          <Categories
            {...props}
            budgetCategories={budget.categories}
            actions={actions}
          />
        ) : null}
      </div>
    </div>
  );
}
