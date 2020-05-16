import { atom, selector, useRecoilValue, useSetRecoilState } from 'recoil';
import getTransactions, { TransacionsResource } from './getTransactions';
import getCategories, { CategoryResource } from './getCategories';
import getAccounts, { AccountsResource } from './getAccounts';
import { settingsState, BudgetState } from '../budget';
import { withRetry } from '../lib';
import { useMemo, useCallback } from 'react';

const cacheToken = atom({
  key: 'moneyMoneyCacheToken',
  default: Symbol(),
});

const categoriesResState = selector({
  key: 'categoriesRes',
  get: ({ get }: any) =>
    getCategories(
      (get(settingsState) as BudgetState['settings']).currency,
      get(cacheToken),
    ),
});
const transactionsResState = selector({
  key: 'transactionsRes',
  get({ get }: any) {
    const { accounts, currency, startDate } = get(
      settingsState,
    ) as BudgetState['settings'];
    return getTransactions(accounts, currency, startDate, get(cacheToken));
  },
});
const accountsResState = selector({
  key: 'accountsRes',
  get: ({ get }: any) =>
    getAccounts(
      (get(settingsState) as BudgetState['settings']).currency,
      get(cacheToken),
    ),
});

function useRetry(resourceState: any) {
  const transactionsRes = useRecoilValue(resourceState);
  const refresh = useRefresh();

  return useMemo(() => withRetry(transactionsRes, refresh), [
    transactionsRes,
    refresh,
  ]);
}

export function useRefresh() {
  const setCacheToken = useSetRecoilState(cacheToken);
  return useCallback(() => setCacheToken(Symbol()), [setCacheToken]);
}
export function useAccounts() {
  return useRetry(accountsResState) as AccountsResource;
}
export function useCategories() {
  return useRetry(categoriesResState) as CategoryResource;
}
export function useTransactions() {
  return useRetry(transactionsResState) as TransacionsResource;
}
