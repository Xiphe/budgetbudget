import React, { Dispatch } from 'react';
import { BudgetState, Action, useBudgetData } from '../../budget';
import { Header, Content } from '../../components';
import Month from '../Month';
import BudgetSlider from './BudgetSlider';
import { UiProvider } from './UiContext';
import CategorySidebar from '../CategorySidebar/CategorySidebar';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Budget({ state }: Props) {
  const { error, retry, budgets, numberFormatter } = useBudgetData(state);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        {retry && <button onClick={retry}>retry</button>}
      </div>
    );
  }

  return (
    <UiProvider>
      <Header />
      <Content>
        <BudgetSlider sticky={<CategorySidebar />}>
          {({ key, date }) => (
            <Month
              key={key}
              date={date}
              budget={budgets[key]}
              numberFormatter={numberFormatter}
            />
          )}
        </BudgetSlider>
      </Content>
    </UiProvider>
  );
}
