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
import { initialInitData } from '../budget/getInitData';
import { useRetryResource } from '../lib';

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

let initialSettings: RequiredSettings | null;
const pSettings = initialInitData.then(([_, { settings }]) => {
  initialSettings = settings;
  return settings;
});
const initialAccountsRes = getAccounts();
const initialCategoriesRes = getCategories();
const initialTransactionsRes = getTransactions(pSettings);

function ignoreError(cb: () => void) {
  try {
    cb();
  } catch (err) {
    /* ¯\_(ツ)_/¯ */
  }
}

initialInitData.then(([initialView]) => {
  switch (initialView) {
    case 'budget':
      ignoreError(() => initialCategoriesRes());
      ignoreError(() => initialTransactionsRes());
      break;
    case 'settings':
    case 'new':
      ignoreError(() => initialAccountsRes());
      break;
  }
});

export function useMoneyMoney(): [
  MoneyMoneyRes,
  (settings: RequiredSettings) => void,
] {
  if (!initialSettings) {
    throw new Error(
      'Unexpected useMoneyMoney call before initialSettings are resolved',
    );
  }

  const [currency, setCurrency] = useState<BudgetState['settings']['currency']>(
    initialSettings.currency,
  );

  const settingsRef = useRef(initialSettings);

  const [readAccounts, setAccountsRes] = useState(() => initialAccountsRes);
  const [readCategories, setCategoriesRes] = useState(
    () => initialCategoriesRes,
  );
  const [readTransactions, setTransactionsRes] = useState(
    () => initialTransactionsRes,
  );

  const refreshAll = useCallback(() => {
    const newAccountsRes = getAccounts();
    setAccountsRes(() => newAccountsRes);

    const newCategoriesRes = getCategories();
    setCategoriesRes(() => newCategoriesRes);

    const newTransactionsRes = getTransactions(
      Promise.resolve(settingsRef.current),
    );
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
      const newTransactionsRes = getTransactions(
        Promise.resolve(settingsRef.current),
      );
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
