import getTransactions from './getTransactions';
import { Transaction } from './Types';
import { useState, useEffect, useCallback } from 'react';

export default function useTransactions(
  startDateTimeStamp: number,
  currency: string,
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
    getTransactions(accountNumbers, currency, startDateTimeStamp)
      .then(setUnlessCanceled)
      .catch(setUnlessCanceled);

    return () => {
      canceled = true;
    };
  }, [state, accountNumbers, currency, startDateTimeStamp]);
  useEffect(() => {
    setState(null);
  }, [accountNumbers]);

  const refresh = useCallback(() => setState(null), []);

  return [state, refresh];
}
