import React, { useState } from 'react';
import { BudgetState, VERSION } from '../../budget';
import {
  Content,
  Button,
  Header,
  HeaderSpacer,
  Startup,
} from '../../components';
import General from '../Settings/General';
import Categories from '../Settings/Categories';
import { useBudgetReducer } from '../../budget';
import useMenu from '../../lib/useMenu';
import { initialSettings, unsaved } from '../../lib';
import { MoneyMoneyResProvider } from '../../moneymoney';

type Props = {
  onCreate: (budget: BudgetState) => void;
};

export default function NewBudget({ onCreate }: Props) {
  const [page, setPage] = useState<'general' | 'categories'>('general');
  useMenu();
  const [state, dispatch] = useBudgetReducer({
    name: '',
    version: VERSION,
    budgets: {},
    settings: initialSettings,
  });

  if (state === null) {
    throw new Error('Unexpected non-initialized state');
  }

  return (
    <MoneyMoneyResProvider settings={state.settings} fallback={<Startup />}>
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
        {page === 'general' && <General state={state} dispatch={dispatch} />}
        {page === 'categories' && (
          <Categories state={state} dispatch={dispatch} />
        )}
      </Content>
    </MoneyMoneyResProvider>
  );
}
