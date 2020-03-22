import getAccounts from './getAccounts';
import { Account } from './Types';
import { useState, useEffect, useCallback } from 'react';

export default function useAccounts(): [Account[] | null | Error, () => void] {
  const [accounts, setAccounts] = useState<Account[] | null | Error>(null);
  useEffect(() => {
    if (accounts !== null) {
      return;
    }
    let canceled = false;
    const setUnlessCanceled = (data: Account[] | Error) => {
      if (!canceled) {
        setAccounts(data);
      }
    };
    getAccounts()
      .then(setUnlessCanceled)
      .catch(setUnlessCanceled);

    return () => {
      canceled = true;
    };
  }, [accounts]);

  return [accounts, useCallback(() => setAccounts(null), [])];
}
