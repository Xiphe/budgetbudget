import React, { Dispatch, useState, useMemo, useCallback } from 'react';
import subMonths from 'date-fns/subMonths';
import addMonths from 'date-fns/addMonths';
import { BudgetState, Action } from '../../budget';
import { formatDateKey } from '../../lib';
import { Header, Sidebar, Content, InfiniteSlider } from '../../components';
import Month from '../Month';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

function getYear(dateInYear: Date) {
  const year = dateInYear.getFullYear();
  return Array(12)
    .fill('')
    .map((_, i) => {
      const date = new Date(`${year}-${i + 1}`);
      return { date, key: formatDateKey(date) };
    });
}

export default function Budget(props: Props) {
  const today = new Date();
  const [months, setMonths] = useState(getYear(today));
  const scrollTo = useMemo(
    () => months.findIndex(({ key }) => key === formatDateKey(today)),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [],
  );
  const loadMore = useCallback(
    (direction: 'left' | 'right') => {
      if (direction === 'left') {
        setMonths([...getYear(subMonths(months[0].date, 1)), ...months]);
      } else {
        setMonths(
          months.concat(getYear(addMonths(months[months.length - 1].date, 1))),
        );
      }
    },
    [months],
  );

  return (
    <>
      <Header />
      <Sidebar />
      <Content>
        <InfiniteSlider scrollTo={scrollTo} loadMore={loadMore}>
          {months.map(({ key }) => (
            <Month key={key} monthKey={key} />
          ))}
        </InfiniteSlider>
      </Content>
    </>
  );
}
