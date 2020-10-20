import { useMemo, useCallback, useState, useRef } from 'react';
import getTransactions, {
  TransactionsResource,
  filterCurrency,
} from './getTransactions';
import getCategories, {
  CategoryResource,
  splitCurrencyCategories,
} from './getCategories';
import getAccounts, { AccountsResource, filterAccounts } from './getAccounts';
import { BudgetState } from '../budget';
import { useRetryResource, Resource } from '../lib';
import { Category, InteropAccount, Transaction } from './Types';

export type MoneyMoneyRes = {
  readCategories: CategoryResource;
  readTransactions: TransactionsResource;
  readAccounts: AccountsResource;
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
    accounts: getAccounts(),
    categories: getCategories(),
    transactions: getTransactions(settings),
  };

  try {
    switch (view) {
      case 'budget':
        init.categories();
        init.transactions();
        break;
      case 'settings':
      case 'new':
        init.accounts();
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

  const [readAccounts, setAccountsRes] = useState(() => initialRes.accounts);
  const [readCategories, setCategoriesRes] = useState(
    () => initialRes.categories,
  );
  const [readTransactions, setTransactionsRes] = useState(
    () => initialRes.transactions,
  );

  const refreshAll = useCallback(() => {
    const newAccountsRes = getAccounts();
    setAccountsRes(() => newAccountsRes);

    const newCategoriesRes = getCategories();
    setCategoriesRes(() => newCategoriesRes);

    const newTransactionsRes = getTransactions(settingsRef.current);
    setTransactionsRes(() => newTransactionsRes);
  }, []);

  const readRetryAccounts = useRetryResource(readAccounts, refreshAll);
  const readFilteredAccounts = useCallback(
    () => filterAccounts(currency, readRetryAccounts()),
    [currency, readRetryAccounts],
  );

  const readRetryCategories = useRetryResource(readCategories, refreshAll);
  const readSplitCategories = useCallback(
    () => splitCurrencyCategories(currency, readRetryCategories()),
    [currency, readRetryCategories],
  );

  const readRetryTransactions = useRetryResource(readTransactions, refreshAll);
  const readFilteredTransactions = useCallback(
    () => filterCurrency(currency, readRetryTransactions()),
    [currency, readRetryTransactions],
  );

  const updateSettings = useCallback((newSettings: RequiredSettings) => {
    setCurrency(newSettings.currency);
    const oldSettings = settingsRef.current;
    settingsRef.current = newSettings;
    if (
      oldSettings.accounts !== newSettings.accounts ||
      oldSettings.startDate !== newSettings.startDate
    ) {
      const newTransactionsRes = getTransactions(settingsRef.current);
      setTimeout(() => {
        setTransactionsRes(() => newTransactionsRes);
      }, 10);
    }
  }, []);

  const moneyMoney = useMemo(
    (): MoneyMoneyRes => ({
      readAccounts: readFilteredAccounts,
      readCategories: readSplitCategories,
      readTransactions: readFilteredTransactions,
      refresh: refreshAll,
    }),
    [
      readFilteredAccounts,
      readSplitCategories,
      readFilteredTransactions,
      refreshAll,
    ],
  );
  return [moneyMoney, updateSettings];
}
