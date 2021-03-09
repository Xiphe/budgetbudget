import React, { useState, Dispatch } from 'react';
import { Action, BudgetState } from '../../budget';
import { Content, Button, Header, HeaderSpacer } from '../../components';
import General from '../Settings/General';
import Categories from '../Settings/Categories';
import useMenu from '../../lib/useMenu';
import { MoneyMoneyRes } from '../../moneymoney';
import { useNumberFormatter } from '../../lib';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
  moneyMoney: MoneyMoneyRes;
  onCreate: () => void;
};

export default function NewBudget({
  onCreate,
  state,
  dispatch,
  moneyMoney,
}: Props) {
  const [page, setPage] = useState<'general' | 'categories'>('general');
  useMenu(moneyMoney.refresh);

  if (state === null) {
    throw new Error('Unexpected non-initialized state');
  }

  const numberFormatter = useNumberFormatter(state.settings.fractionDigits);

  return (
    <Content
      padding
      scroll
      header={
        <Header>
          <span>Create a new Budget</span>
          <HeaderSpacer />
          {page === 'general' && (
            <Button
              primary
              disabled={!state.name.length || !state.settings.accounts.length}
              onClick={() => setPage('categories')}
            >
              Choose Income Categories
            </Button>
          )}
          {page === 'categories' && (
            <Button primary onClick={onCreate}>
              Create "{state.name}"
            </Button>
          )}
        </Header>
      }
    >
      {page === 'general' && (
        <General
          moneyMoney={moneyMoney}
          state={state}
          dispatch={dispatch}
          numberFormatter={numberFormatter}
        />
      )}
      {page === 'categories' && (
        <Categories moneyMoney={moneyMoney} state={state} dispatch={dispatch} />
      )}
    </Content>
  );
}
