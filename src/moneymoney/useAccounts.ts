import { selector, useRecoilState } from 'recoil';
import getAccountsRes, { AccountsResource } from './getAccounts';
import { useMemo } from 'react';
import { withRefresh } from '../lib/createResource';
import { settingsState, BudgetState } from '../budget';

const accountsResState = selector({
  key: 'accountsRes',
  get: ({ get }: any) =>
    getAccountsRes((get(settingsState) as BudgetState['settings']).currency),
});

export function useAccounts(): AccountsResource {
  const [accounts, setAccounts] = useRecoilState(accountsResState);

  return useMemo(
    () => withRefresh(accounts, () => setAccounts(accounts.reCreate())),
    [accounts, setAccounts],
  );
}
