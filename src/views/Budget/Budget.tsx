import React, {
  Dispatch,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import isSameMonth from 'date-fns/isSameMonth';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import { BudgetState, Action, useBudgetData } from '../../budget';
import { Content, InfiniteSlider, ScrollTo } from '../../components';
import {
  HeaderHeightProvider,
  VisibleMothContextProvider,
  getToday,
} from '../../lib';
import Month from '../Month';
import BudgetHeader from './Header';
import CategorySidebar from '../CategorySidebar/CategorySidebar';
import styles from './Budget.module.scss';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Budget({ state, dispatch }: Props) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const onSliderScrollRef = useRef<((target: HTMLDivElement) => void) | null>(
    null,
  );
  const [scrollTo, setScrollTo] = useState<ScrollTo | null>(null);
  const { months, numberFormatter, extendFuture, categories } = useBudgetData(
    state,
  );
  const handleHeaderMonthClick = useCallback(
    (key: string) => {
      if (!scrollTo) {
        return;
      }
      const index = months.findIndex(({ key: k }) => key === k);
      if (index === -1) {
        const target = new Date(key);
        const last = months[months.length - 1].date;
        const difference = differenceInCalendarMonths(target, last);
        extendFuture(difference + 2);
        setTimeout(() => {
          scrollTo(months.length + difference - 1);
        }, 0);
      } else {
        scrollTo(index);
      }
    },
    [months, extendFuture, scrollTo],
  );
  useEffect(() => {
    if (scrollTo) {
      const today = getToday();
      scrollTo(
        months.findIndex(({ date }) => isSameMonth(today, date)),
        'auto',
      );
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [scrollTo]);
  const loadMore = useCallback(() => {
    extendFuture(12);
  }, [extendFuture]);

  return (
    <VisibleMothContextProvider>
      <HeaderHeightProvider>
        <Content
          flex
          header={
            <BudgetHeader
              onClick={handleHeaderMonthClick}
              scrollRef={onSliderScrollRef}
              months={months}
            />
          }
        >
          <CategorySidebar
            syncScrollY={sliderRef}
            innerRef={sidebarRef}
            budgetName={state.name}
            dispatch={dispatch}
            collapsedCategories={state.settings.collapsedCategories}
            categories={categories || []}
          />
          <InfiniteSlider
            innerRef={sliderRef}
            onScrollRef={onSliderScrollRef}
            className={styles.budgetSlider}
            loadMore={loadMore}
            syncScrollY={sidebarRef}
            getScrollTo={setScrollTo}
          >
            {months.map((month) => (
              <Month
                key={month.key}
                monthKey={month.key}
                date={month.date}
                dispatch={dispatch}
                collapsedCategories={state.settings.collapsedCategories}
                month={month}
                categories={categories || []}
                numberFormatter={numberFormatter}
              />
            ))}
          </InfiniteSlider>
        </Content>
      </HeaderHeightProvider>
    </VisibleMothContextProvider>
  );
}
