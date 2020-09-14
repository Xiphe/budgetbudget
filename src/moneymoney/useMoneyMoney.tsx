import React, {
  useMemo,
  useCallback,
  createContext,
  ReactNode,
  useState,
  useEffect,
  Suspense,
  useContext,
  SuspenseProps,
} from 'react';
import getTransactions, { TransactionsResource } from './getTransactions';
import getCategories, { CategoryResource } from './getCategories';
import getAccounts, { AccountsResource } from './getAccounts';
import { ErrorBoundary } from '../components';
import { BudgetState } from '../budget';
import { withRetry } from '../lib';

const INITIAL_CACHE_TOKEN = Symbol();

type MoneyMoneyContext = {
  refresh: () => void;
  categoriesRes: CategoryResource;
  transactionRes: TransactionsResource;
  accountsRes: AccountsResource;
};
const MoneyMoneyResContext = createContext<Partial<MoneyMoneyContext>>({});

type ProviderProps = {
  settings: BudgetState['settings'];
  fallback: SuspenseProps['fallback'];
  children: ReactNode;
};
export default function MoneyMoneyResProvider({
  settings: { accounts, currency, startDate },
  fallback,
  children,
}: ProviderProps) {
  const [cacheToken, setCacheToken] = useState<symbol>(INITIAL_CACHE_TOKEN);
  const refresh = useCallback(() => setCacheToken(Symbol()), [setCacheToken]);

  const createCategoryRes = useCallback(
    () => withRetry(getCategories(currency, cacheToken), refresh),
    [currency, cacheToken, refresh],
  );
  const [categoriesRes, setCategoriesRes] = useState<CategoryResource>(
    createCategoryRes,
  );
  useEffect(() => setCategoriesRes(createCategoryRes()), [createCategoryRes]);

  const createTransactionsRes = useCallback(
    () =>
      withRetry(
        getTransactions(accounts, currency, startDate, cacheToken),
        refresh,
      ),
    [accounts, currency, startDate, cacheToken, refresh],
  );
  const [transactionRes, setTransactionRes] = useState<TransactionsResource>(
    createTransactionsRes,
  );
  useEffect(() => setTransactionRes(createTransactionsRes()), [
    createTransactionsRes,
  ]);

  const createAccountsRes = useCallback(
    () => withRetry(getAccounts(currency, cacheToken), refresh),
    [currency, cacheToken, refresh],
  );
  const [accountsRes, setAccountsRes] = useState<AccountsResource>(
    createAccountsRes,
  );
  useEffect(() => setAccountsRes(createAccountsRes()), [createAccountsRes]);

  return (
    <MoneyMoneyResContext.Provider
      value={useMemo<MoneyMoneyContext>(
        () => ({
          refresh,
          accountsRes,
          transactionRes,
          categoriesRes,
        }),
        [refresh, accountsRes, transactionRes, categoriesRes],
      )}
    >
      <Suspense fallback={fallback}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </Suspense>
    </MoneyMoneyResContext.Provider>
  );
}

export function useRefresh() {
  const { refresh } = useContext(MoneyMoneyResContext);
  return refresh;
}
export function useAccounts() {
  const { accountsRes } = useContext(MoneyMoneyResContext);
  if (!accountsRes) {
    throw new Error('Can not useAccounts outside of MoneyMoneyResContext');
  }
  return accountsRes;
}
export function useCategories() {
  const { categoriesRes } = useContext(MoneyMoneyResContext);
  if (!categoriesRes) {
    throw new Error('Can not useCategories outside of MoneyMoneyResContext');
  }
  return categoriesRes;
}
export function useTransactions() {
  const { transactionRes } = useContext(MoneyMoneyResContext);
  if (!transactionRes) {
    throw new Error('Can not useTransactions outside of MoneyMoneyResContext');
  }
  return transactionRes;
}
