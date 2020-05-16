import { atom, useSetRecoilState, useRecoilState } from 'recoil';
import getAccountsRes, { AccountsResource } from './getAccounts';
import { useEffect, useMemo } from 'react';
import createResource, { withRefresh } from '../lib/createResource';

const accountsResState = atom({
  key: 'accountsRes',
  default: null,
});

export function useInitiateAccounts(ini: boolean) {
  const setAccounts = useSetRecoilState(accountsResState);
  useEffect(() => {
    if (ini) {
      setAccounts((prev: AccountsResource | null) => {
        return prev || getAccountsRes();
      });
    }
  }, [ini, setAccounts]);
}

function useLazyRecoilState(recoilState: any, fallback: any) {
  const [state, setState] = useRecoilState(recoilState);
  return [state || fallback, setState];
}

export function useAccounts(): AccountsResource {
  const [accounts, setAccounts] = useLazyRecoilState(
    accountsResState,
    useMemo(
      () =>
        createResource(
          () =>
            new Promise((_, rej) => {
              setTimeout(
                () => rej(new Error('Failed to initiate accounts')),
                3000,
              );
            }),
        ),
      [],
    ),
  );

  return useMemo(
    () => withRefresh(accounts, () => setAccounts(accounts.reCreate())),
    [accounts, setAccounts],
  );
}
