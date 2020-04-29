import React, { useState, useReducer } from 'react';
import { remote, ipcRenderer } from 'electron';
import { BudgetState, VERSION } from '../../budget';
import { Content, Button, Header, HeaderSpacer } from '../../components';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import General from '../Settings/General';
import Categories from '../Settings/Categories';
import budgetReducer from '../../budget/budgetReducer';
import useMenu from '../../budget/useMenu';

type Props = {
  onCreate: (budget: BudgetState) => void;
};

export default function NewBudget({ onCreate }: Props) {
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
      startDate: startOfMonth(subMonths(new Date(), 1)).getTime(),
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
                onCreate(state);
                ipcRenderer.send('SAVE_AS');
              }}
            >
              Create "{state.name}"
            </Button>
          )}
        </Header>
      }
    >
      {page === 'general' && <General state={state} dispatch={dispatch} />}
      {page === 'categories' && (
        <Categories state={state} dispatch={dispatch} />
      )}
    </Content>
  );
}
