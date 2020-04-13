import React, { Dispatch, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import isAfter from 'date-fns/isAfter';
import subMonths from 'date-fns/subMonths';
import addMonths from 'date-fns/addMonths';
import { BudgetState, Action, useBudgetData } from '../../budget';
import { Content, Loading } from '../../components';
import {
  appName,
  HeaderHeightProvider,
  VisibleMothContextProvider,
  formatDateKey,
} from '../../lib';
import Month from '../Month';
import BudgetSlider, { ScrollToProvider } from './BudgetSlider';
import BudgetHeader from './Header';
import CategorySidebar from '../CategorySidebar/CategorySidebar';

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

export default function Budget({ state, dispatch }: Props) {
  const {
    loading,
    error,
    retry,
    budgets,
    lastDate,
    pastBudget,
    futureBudget,
    numberFormatter,
    categories,
  } = useBudgetData(state);
  const [months, setMonths] = useState(() => getYear(new Date()));
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

  const title = (
    <Helmet>
      <title>
        {state.name} - {appName}
      </title>
    </Helmet>
  );

  if (error) {
    return (
      <div>
        {title}
        <p>Error: {error.message}</p>
        {retry && <button onClick={retry}>retry</button>}
      </div>
    );
  }

  if (loading) {
    return (
      <>
        {title}
        <Loading />
      </>
    );
  }

  return (
    <VisibleMothContextProvider>
      <HeaderHeightProvider>
        <ScrollToProvider>
          {title}
          <Content header={<BudgetHeader months={months} />}>
            <BudgetSlider
              loadMore={loadMore}
              months={months}
              sticky={<CategorySidebar categories={categories || []} />}
            >
              {({ key, date }) => (
                <Month
                  key={key}
                  monthKey={key}
                  date={date}
                  dispatch={dispatch}
                  budget={
                    budgets[key] ||
                    (lastDate && isAfter(date, lastDate)
                      ? futureBudget
                      : pastBudget)
                  }
                  categories={categories || []}
                  numberFormatter={numberFormatter}
                />
              )}
            </BudgetSlider>
          </Content>
        </ScrollToProvider>
      </HeaderHeightProvider>
    </VisibleMothContextProvider>
  );
}
