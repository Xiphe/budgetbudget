import React, { useState, useReducer } from 'react';
import { remote, ipcRenderer } from 'electron';
import { Helmet } from 'react-helmet';
import { BudgetState, VERSION } from '../../budget';
import { Content, Button, Header } from '../../components';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import General from '../Settings/General';
import Categories from '../Settings/Categories';
import budgetReducer from '../../budget/budgetReducer';
import styles from './NewBudget.module.scss';
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
        <Header className={styles.header}>
          <h1>Create a new Budget</h1>
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
      <Helmet>
        <title>New Budget - {remote.app.name}</title>
      </Helmet>
      {page === 'general' && <General state={state} dispatch={dispatch} />}
      {page === 'categories' && (
        <Categories state={state} dispatch={dispatch} />
      )}
    </Content>
  );
}
