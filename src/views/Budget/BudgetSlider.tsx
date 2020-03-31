import React, {
  ReactNode,
  ReactElement,
  useState,
  useMemo,
  useCallback,
} from 'react';
import subMonths from 'date-fns/subMonths';
import addMonths from 'date-fns/addMonths';
import { formatDateKey } from '../../lib';
import { InfiniteSlider } from '../../components';

function getYear(dateInYear: Date) {
  const year = dateInYear.getFullYear();
  return Array(12)
    .fill('')
    .map((_, i) => {
      const date = new Date(`${year}-${i + 1}`);
      return { date, key: formatDateKey(date) };
    });
}

type Props = {
  sticky: ReactNode;
  children: (month: { key: string; date: Date }, i: number) => ReactElement;
};

export default function BudgetSlider({ children, sticky }: Props) {
  const today = new Date();
  const [months, setMonths] = useState(() => getYear(today));
  const scrollTo = useMemo(
    () => months.findIndex(({ key }) => key === formatDateKey(today)),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [],
  );
  const loadMore = useCallback((direction: 'left' | 'right') => {
    if (direction === 'left') {
      setMonths((prevMonths) => [
        ...getYear(subMonths(prevMonths[0].date, 1)),
        ...prevMonths,
      ]);
    } else {
      setMonths((prevMonths) =>
        prevMonths.concat(
          getYear(addMonths(prevMonths[prevMonths.length - 1].date, 1)),
        ),
      );
    }
  }, []);

  return (
    <InfiniteSlider scrollTo={scrollTo} loadMore={loadMore} sticky={sticky}>
      {months.map(children)}
    </InfiniteSlider>
  );
}
