import React, {
  ReactNode,
  ReactElement,
  useState,
  useCallback,
  useContext,
  createContext,
  useRef,
  FC,
  MutableRefObject,
} from 'react';

import { formatDateKey } from '../../lib';
import { InfiniteSlider } from '../../components';
import { isAfter } from 'date-fns';

type ScrollTo = (date: Date) => void;
const ScrollToContext = createContext<MutableRefObject<
  ScrollTo | undefined
> | null>(null);

export const ScrollToProvider: FC = ({ children }) => {
  const scrollToRef = useRef<ScrollTo>();

  return (
    <ScrollToContext.Provider value={scrollToRef}>
      {children}
    </ScrollToContext.Provider>
  );
};
function useScrollToRef() {
  const scrollTo = useContext(ScrollToContext);
  if (!scrollTo) {
    throw new Error('can not useScrollTo outside of ScrollToProvider');
  }
  return scrollTo;
}
export function useScrollTo() {
  const scrollToRef = useScrollToRef();
  return useCallback(
    (date: Date) => {
      if (!scrollToRef.current) {
        throw new Error('Can not scroll');
      }
      scrollToRef.current(date);
    },
    [scrollToRef],
  );
}

type Props = {
  sticky: ReactNode;
  months: { date: Date; key: string }[];
  loadMore: (direction: 'left' | 'right') => void;
  children: (month: { key: string; date: Date }, i: number) => ReactElement;
};

export default function BudgetSlider({
  children,
  sticky,
  months,
  loadMore,
}: Props) {
  const scrollToRef = useScrollToRef();
  const [scrollTo, setScrollTo] = useState<number>(
    () => months.findIndex(({ key }) => key === formatDateKey(new Date())) + 1,
  );
  scrollToRef.current = (targetDate: Date) => {
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();
    const index = months.findIndex(
      ({ date }) =>
        date.getMonth() === targetMonth && date.getFullYear() === targetYear,
    );
    if (index !== -1) {
      setScrollTo(index);
    } else if (isAfter(targetDate, months[months.length - 1].date)) {
      setScrollTo(months.length - 1);
    } else {
      setScrollTo(0);
    }
  };

  return (
    <InfiniteSlider scrollTo={scrollTo} loadMore={loadMore} sticky={sticky}>
      {months.map(children)}
    </InfiniteSlider>
  );
}
