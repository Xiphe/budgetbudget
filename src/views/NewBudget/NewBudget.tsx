import React, { useState, useReducer } from 'react';
import { remote } from 'electron';
import { BudgetState, VERSION } from '../../budget';
import { Content, Button, Header, HeaderSpacer } from '../../components';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import General from '../Settings/General';
import Categories from '../Settings/Categories';
import { budgetReducer } from '../../budget';
import useMenu from '../../lib/useMenu';
import { getToday, unsaved } from '../../lib';
import { AccountsResource } from '../../moneymoney';

type Props = {
  accountsRes: AccountsResource;
  onCreate: (budget: BudgetState) => void;
};

export default function NewBudget({ onCreate, accountsRes }: Props) {
  const [page, setPage] = useState<'general' | 'categories'>('general');
  useMenu();
  const [state, dispatch] = useReducer(budgetReducer, {
    name: '',
    version: VERSION,
    budgets: {},
    settings: {
      accounts: [],
      currency: 'EUR',
      incomeCategories: [],
      fractionDigits: 2,
      startDate: startOfMonth(subMonths(getToday(), 1)).getTime(),
      startBalance: 0,
      numberLocale: remote.app.getLocale(),
    },
  });

  if (state === null) {
    throw new Error('Unexpected non-initialized state');
  }

  return (
    <Content
      padding
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
            <Button
              primary
              onClick={() => {
                onCreate(unsaved(state));
              }}
            >
              Create "{state.name}"
            </Button>
          )}
        </Header>
      }
    >
      {page === 'general' && (
        <General state={state} dispatch={dispatch} accountsRes={accountsRes} />
      )}
      {page === 'categories' && (
        <Categories state={state} dispatch={dispatch} />
      )}
    </Content>
  );
}
