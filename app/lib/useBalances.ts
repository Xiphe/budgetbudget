import { useState, useEffect } from 'react';
import { useClient, MonthlyBalance } from './moneyMoney';
import { IpcError } from '../../shared/ipc';

export default function useBalances() {
  const api = useClient();
  const [balances, setBalances] = useState<MonthlyBalance[] | null | IpcError>(
    null,
  );
  useEffect(() => {
    let canceled = false;
    const setUnlessCanceled = (transactions: MonthlyBalance[] | IpcError) => {
      if (!canceled) {
        setBalances(transactions);
      }
    };
    api.getBalances().then(setUnlessCanceled, setUnlessCanceled);
    return () => {
      canceled = true;
    };
  }, [api, setBalances]);
  return balances;
}
