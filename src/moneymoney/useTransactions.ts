import getTransactions from './getTransactions';
import { Transaction } from './Types';
import { useState, useEffect, useCallback } from 'react';

export default function useBalancesAndCategories(
  accountNumbers?: string[],
): [Transaction[] | null | Error, () => void] {
  const [state, setState] = useState<Transaction[] | null | Error>(null);
  useEffect(() => {
    if (!accountNumbers || !accountNumbers.length || state !== null) {
      return;
    }
    let canceled = false;
    const setUnlessCanceled = (data: Transaction[] | Error) => {
      if (!canceled) {
        setState(data);
      }
    };
    getTransactions(accountNumbers)
      .then(setUnlessCanceled)
      .catch(setUnlessCanceled);

    return () => {
      canceled = true;
    };
  }, [state, accountNumbers]);
  useEffect(() => {
    setState(null);
  }, [accountNumbers]);

  const refresh = useCallback(() => setState(null), []);

  return [state, refresh];
}