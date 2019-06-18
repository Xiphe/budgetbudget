import { useContext, useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import { MONEY_MONEY_API_IPC_CHANNEL as CHANNEL } from '../../shared/constants';
import { client, RetryHandler } from '../../shared/ipc';
import { ACTIONS, AllMessages } from '../../shared/MoneyMoneyApiTypes';
import { ErrorContext } from './components/ErrorBoundary';

export * from '../../shared/MoneyMoneyApiTypes';

function createApiClient(retryHandler: RetryHandler) {
  return client<AllMessages>(
    CHANNEL,
    ipcRenderer,
    ipcRenderer.send,
    ACTIONS,
    retryHandler,
  );
}

type ApiClient = ReturnType<typeof createApiClient>;

export function useClient() {
  const setError = useContext(ErrorContext);
  const [api, setApi] = useState<ApiClient>();
  useEffect(() => {
    setApi(
      createApiClient((err) => {
        const originalCancel = err.cancel;
        const originalRetry = err.retry;
        err.cancel = () => {
          setError(null);
          originalCancel();
        };
        err.retry = () => {
          setError(null);
          originalRetry();
        };
        setError(err);
      }),
    );
  }, [setApi, setError]);

  return api;
}
