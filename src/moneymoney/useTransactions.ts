import { selector, useRecoilState } from 'recoil';
import getTransactions, { TransacionsResource } from './getTransactions';
import { useMemo } from 'react';
import createResource, { withRefresh } from '../lib/createResource';
import { settingsState, BudgetState } from '../budget';

const transactionsResState = selector({
  key: 'transactionsRes',
  get({ get }: any) {
    const { accounts, currency, startDate } = get(
      settingsState,
    ) as BudgetState['settings'];
    return getTransactions(accounts, currency, startDate);
  },
});

function useLazyRecoilState(recoilState: any, fallback: any) {
  const [state, setState] = useRecoilState(recoilState);
  return [state || fallback, setState];
}

export default function useTransactions(): TransacionsResource {
  const [transactionsRes, settransactionsRes] = useLazyRecoilState(
    transactionsResState,
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
    () =>
      withRefresh(transactionsRes, () =>
        settransactionsRes(transactionsRes.reCreate()),
      ),
    [transactionsRes, settransactionsRes],
  );
}
