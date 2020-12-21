import React, {
  Dispatch,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import isSameMonth from 'date-fns/isSameMonth';
import differenceInCalendarMonths from 'date-fns/differenceInCalendarMonths';
import { BudgetState, BudgetAction, useBudgetData } from '../../budget';
import { Content, InfiniteSlider, ScrollTo } from '../../components';
import {
  HeaderHeightProvider,
  VisibleMothContextProvider,
  getToday,
  MonthsContextProvider,
  NumberFormatter,
} from '../../lib';
import Month from '../Month';
import BudgetHeader from './Header';
import CategorySidebar from '../CategorySidebar/CategorySidebar';
import styles from './Budget.module.scss';
import { MoneyMoneyRes } from '../../moneymoney';
import { SidebarHeader, SidebarWrap } from '../CategorySidebar';
import Overview from '../Month/Overview';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<BudgetAction>;
  moneyMoney: MoneyMoneyRes;
  numberFormatter: NumberFormatter;
};

export default function Budget({
  state,
  dispatch,
  moneyMoney,
  numberFormatter,
}: Props) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const onSliderScrollRef = useRef<((target: HTMLDivElement) => void) | null>(
    null,
  );
  const [scrollTo, setScrollTo] = useState<ScrollTo | null>(null);
  const { months, extendFuture, categories } = useBudgetData(state, moneyMoney);
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
    <MonthsContextProvider value={months}>
      <VisibleMothContextProvider>
        <HeaderHeightProvider>
          <Content
            flex
            header={
              <BudgetHeader
                onClick={handleHeaderMonthClick}
                scrollRef={onSliderScrollRef}
              />
            }
          >
            <SidebarWrap>
              <SidebarHeader title={state.name} />
              <CategorySidebar
                syncScrollY={sliderRef}
                innerRef={sidebarRef}
                dispatch={dispatch}
                collapsedCategories={state.settings.collapsedCategories}
                categories={categories || []}
              />
            </SidebarWrap>
            <InfiniteSlider
              style={
                sidebarRef.current
                  ? ({
                      '--sidebar-height': `${sidebarRef.current.scrollHeight}px`,
                    } as any)
                  : undefined
              }
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
                >
                  {(data) => (
                    <Overview
                      month={month}
                      data={data}
                      numberFormatter={numberFormatter}
                    />
                  )}
                </Month>
              ))}
            </InfiniteSlider>
          </Content>
        </HeaderHeightProvider>
      </VisibleMothContextProvider>
    </MonthsContextProvider>
  );
}
