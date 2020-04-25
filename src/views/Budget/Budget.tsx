import React, { Dispatch, useRef } from 'react';
import { remote } from 'electron';
import { Helmet } from 'react-helmet';
import { BudgetState, Action, useBudgetData } from '../../budget';
import { Content, Loading, InfiniteSlider } from '../../components';
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
  const {
    loading,
    error,
    retry,
    budgets,
    numberFormatter,
    extendFuture,
    categories,
  } = useBudgetData(state);

  const title = (
    <Helmet>
      <title>
        {state.name} - {remote.app.name}
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
        <Content
          header={
            <BudgetHeader scrollRef={onSliderScrollRef} months={budgets} />
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
            loadMore={() => extendFuture(2)}
            syncScrollY={sidebarRef}
            scrollTo={0}
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
