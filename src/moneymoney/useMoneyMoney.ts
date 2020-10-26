import { useMemo, useCallback, useState, useRef } from 'react';
import {
  getTransactions,
  TransactionsResource,
  filterCurrency,
} from './getTransactions';
import {
  getCategories,
  CategoryResource,
  splitCurrencyCategories,
} from './getCategories';
import { AccountsResource, filterAccounts, getAccounts } from './getAccounts';
import { BudgetState } from '../budget';
import { createHOR, createResource, Resource, withRetry } from '../lib';
import { Category, InteropAccount, Transaction } from './Types';

export type MoneyMoneyRes = {
  categories: CategoryResource;
  transactions: TransactionsResource;
  accounts: AccountsResource;
  refresh: () => void;
};

type RequiredSettings = Pick<
  BudgetState['settings'],
  'accounts' | 'currency' | 'startDate'
>;

export type InitialRes = {
  settings: RequiredSettings;
  accounts: Resource<InteropAccount[]>;
  categories: Resource<Category[]>;
  transactions: Resource<Transaction[]>;
};

export function createInitialRes(
  view: 'budget' | 'settings' | 'new',
  settings: RequiredSettings,
): InitialRes {
  const init: InitialRes = {
    settings,
    accounts: createResource(() => getAccounts(), { lazy: true }),
    categories: createResource(() => getCategories(), { lazy: true }),
    transactions: createResource(
      () => getTransactions(settings.accounts, settings.startDate),
      {
        lazy: true,
      },
    ),
  };

  try {
    switch (view) {
      case 'budget':
        init.categories.read();
        init.transactions.read();
        break;
      case 'settings':
      case 'new':
        init.accounts.read();
        break;
    }
  } catch (err) {
    /* ¯\_(ツ)_/¯ */
  }

  return init;
}

export function useMoneyMoney(
  initialRes: InitialRes,
): [MoneyMoneyRes, (settings: RequiredSettings) => void] {
  const [currency, setCurrency] = useState<BudgetState['settings']['currency']>(
    initialRes.settings.currency,
  );

  const settingsRef = useRef<RequiredSettings>(initialRes.settings);

  const [accountsRes, setAccountsRes] = useState(initialRes.accounts);
  const [readCategories, setCategoriesRes] = useState(initialRes.categories);
  const [readTransactions, setTransactionsRes] = useState(
    initialRes.transactions,
  );

  const refreshAll = useCallback(() => {
    setAccountsRes((prev) => prev.recreate());
    setCategoriesRes((prev) => prev.recreate());
    setTransactionsRes((prev) => prev.recreate());
  }, []);

  const filteredAccountsRes = useMemo(() => {
    const retryRes = createHOR(accountsRes, withRetry(refreshAll));
    return createHOR(retryRes, (res) => () =>
      filterAccounts(currency, res.read()),
    );
  }, [currency, refreshAll, accountsRes]);

  const splitCategoriesRes = useMemo(() => {
    const retryRes = createHOR(readCategories, withRetry(refreshAll));
    return createHOR(retryRes, (res) => () =>
      splitCurrencyCategories(currency, res.read()),
    );
  }, [currency, refreshAll, readCategories]);

  const filteredTransactionsRes = useMemo(() => {
    const retryRes = createHOR(readTransactions, withRetry(refreshAll));
    return createHOR(retryRes, (res) => () =>
      filterCurrency(currency, res.read()),
    );
  }, [currency, refreshAll, readTransactions]);

  const updateSettings = useCallback((newSettings: RequiredSettings) => {
    setCurrency(newSettings.currency);
    const oldSettings = settingsRef.current;
    settingsRef.current = newSettings;
    if (
      oldSettings.accounts !== newSettings.accounts ||
      oldSettings.startDate !== newSettings.startDate
    ) {
      const { accounts, startDate } = newSettings;
      setTimeout(() => {
        setTransactionsRes(
          createResource(() => getTransactions(accounts, startDate), {
            lazy: true,
          }),
        );
      }, 10);
    }
  }, []);

  const moneyMoney = useMemo(
    (): MoneyMoneyRes => ({
      accounts: filteredAccountsRes,
      categories: splitCategoriesRes,
      transactions: filteredTransactionsRes,
      refresh: refreshAll,
    }),
    [
      filteredAccountsRes,
      splitCategoriesRes,
      filteredTransactionsRes,
      refreshAll,
    ],
  );
  return [moneyMoney, updateSettings];
}
