import React, {
  useMemo,
  useCallback,
  createContext,
  ReactNode,
  useState,
  Suspense,
  useContext,
  SuspenseProps,
  MutableRefObject,
} from 'react';
import getTransactions, { TransactionsResource } from './getTransactions';
import getCategories, { CategoryResource } from './getCategories';
import getAccounts, { AccountsResource } from './getAccounts';
import { ErrorBoundary } from '../components';
import { BudgetState } from '../budget';
import { withRetry } from '../lib';

type MoneyMoneyContext = {
  categoriesRes: CategoryResource;
  transactionRes: TransactionsResource;
  accountsRes: AccountsResource;
};
const MoneyMoneyResContext = createContext<Partial<MoneyMoneyContext>>({});

type ProviderProps = {
  refreshRef: MutableRefObject<(() => void) | undefined>;
  settings: BudgetState['settings'];
  fallback: SuspenseProps['fallback'];
  children: ReactNode;
};
export default function MoneyMoneyResProvider({
  refreshRef,
  settings: { accounts, currency, startDate },
  fallback,
  children,
}: ProviderProps) {
  const refresh = useCallback(() => {
    setCategoriesRes(withRetry(getCategories(currency), refreshRef));
    setTransactionRes(
      withRetry(getTransactions(accounts, currency, startDate), refreshRef),
    );
    setAccountsRes(withRetry(getAccounts(currency), refreshRef));
  }, [refreshRef, accounts, currency, startDate]);
  refreshRef.current = refresh;

  const [categoriesRes, setCategoriesRes] = useState<CategoryResource>(() =>
    withRetry(getCategories(currency), refreshRef),
  );
  const [transactionRes, setTransactionRes] = useState<TransactionsResource>(
    () => withRetry(getTransactions(accounts, currency, startDate), refreshRef),
  );
  const [accountsRes, setAccountsRes] = useState<AccountsResource>(() =>
    withRetry(getAccounts(currency), refreshRef),
  );

  return (
    <MoneyMoneyResContext.Provider
      value={useMemo<MoneyMoneyContext>(
        () => ({
          accountsRes,
          transactionRes,
          categoriesRes,
        }),
        [accountsRes, transactionRes, categoriesRes],
      )}
    >
      <Suspense fallback={fallback}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </Suspense>
    </MoneyMoneyResContext.Provider>
  );
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
