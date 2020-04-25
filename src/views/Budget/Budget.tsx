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
import { Content, Loading, InfiniteSlider, ScrollTo } from '../../components';
import { HeaderHeightProvider, VisibleMothContextProvider } from '../../lib';
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
  const {
    loading,
    error,
    retry,
    budgets,
    numberFormatter,
    extendFuture,
    categories,
  } = useBudgetData(state);
  const handleHeaderMonthClick = useCallback(
    (key: string) => {
      if (!scrollTo) {
        return;
      }
      const index = budgets.findIndex(({ key: k }) => key === k);
      if (index === -1) {
        const target = new Date(key);
        const last = budgets[budgets.length - 1].date;
        const difference = differenceInCalendarMonths(target, last);
        extendFuture(difference + 2);
        setTimeout(() => {
          scrollTo(budgets.length + difference - 1);
        }, 0);
      } else {
        scrollTo(index);
      }
    },
    [budgets, extendFuture, scrollTo],
  );
  useEffect(() => {
    if (scrollTo) {
      const today = new Date();
      scrollTo(
        budgets.findIndex(({ date }) => isSameMonth(today, date)),
        'auto',
      );
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [scrollTo]);
  const loadMore = useCallback(() => {
    extendFuture(12);
  }, [extendFuture]);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        {retry && <button onClick={retry}>retry</button>}
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  return (
    <VisibleMothContextProvider>
      <HeaderHeightProvider>
        <Content
          flex
          header={
            <BudgetHeader
              onClick={handleHeaderMonthClick}
              scrollRef={onSliderScrollRef}
              months={budgets}
            />
          }
        >
          <CategorySidebar
            syncScrollY={sliderRef}
            innerRef={sidebarRef}
            budgetName={state.name}
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
            {budgets.map((budget) => (
              <Month
                key={budget.key}
                monthKey={budget.key}
                date={budget.date}
                dispatch={dispatch}
                budget={budget}
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
