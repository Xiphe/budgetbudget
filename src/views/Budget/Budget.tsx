import React, { Dispatch } from 'react';
import { Helmet } from 'react-helmet';
import isAfter from 'date-fns/isAfter';
import { BudgetState, Action, useBudgetData } from '../../budget';
import { Header, Content, Loading } from '../../components';
import { appName, HeaderHeightProvider } from '../../lib';
import Month from '../Month';
import BudgetSlider from './BudgetSlider';
import CategorySidebar from '../CategorySidebar/CategorySidebar';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Budget({ state, dispatch }: Props) {
  const {
    loading,
    error,
    retry,
    budgets,
    lastDate,
    futureBudget,
    numberFormatter,
    currency,
    categories,
  } = useBudgetData(state);
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
    <HeaderHeightProvider>
      {title}
      <Header />
      <Content>
        <BudgetSlider
          sticky={<CategorySidebar categories={categories || []} />}
        >
          {({ key, date }) => (
            <Month
              key={key}
              monthKey={key}
              date={date}
              currency={currency}
              dispatch={dispatch}
              budget={
                budgets[key] ||
                (lastDate && isAfter(date, lastDate) ? futureBudget : undefined)
              }
              categories={categories || []}
              numberFormatter={numberFormatter}
            />
          )}
        </BudgetSlider>
      </Content>
    </HeaderHeightProvider>
  );
}
