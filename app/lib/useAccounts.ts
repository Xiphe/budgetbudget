import { useState, useEffect } from 'react';
import { Account, useClient } from './moneyMoney';
import { IpcError } from '../../shared/ipc';

export default function useAccounts() {
  const api = useClient();
  const [accounts, setAccounts] = useState<Account[] | null | IpcError>(null);
  useEffect(() => {
    let canceled = false;
    const setUnlessCanceled = (accounts: Account[] | IpcError) => {
      if (!canceled) {
        setAccounts(accounts);
      }
    };
    api.getAccounts().then(setUnlessCanceled, setUnlessCanceled);
    return () => {
      canceled = true;
    };
  }, [api, setAccounts]);
  return accounts;
}
