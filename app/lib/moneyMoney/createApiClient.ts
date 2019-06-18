import { ipcRenderer } from 'electron';
import { MONEY_MONEY_API_IPC_CHANNEL as CHANNEL } from '../../../shared/constants';
import { client, RetryHandler } from '../../../shared/ipc';
import { ACTIONS, AllMessages } from '../../../shared/MoneyMoneyApiTypes';

export default function createApiClient(retryHandler: RetryHandler) {
  return client<AllMessages>(
    CHANNEL,
    ipcRenderer,
    ipcRenderer.send,
    ACTIONS,
    retryHandler,
  );
}
export type ApiClient = ReturnType<typeof createApiClient>;
