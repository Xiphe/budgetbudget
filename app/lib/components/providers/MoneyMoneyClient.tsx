import React, { useContext, ReactNode, useMemo } from 'react';
import { ErrorContext } from './ErrorHandler';
import createApiClient from '../../moneyMoney/createApiClient';
import ClientContext from '../../moneyMoney/ClientContext';

export default function MoneyMoneyClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const setError = useContext(ErrorContext);
  const api = useMemo(() => {
    return createApiClient(setError);
  }, [setError]);
  return (
    <ClientContext.Provider value={api}>{children}</ClientContext.Provider>
  );
}
