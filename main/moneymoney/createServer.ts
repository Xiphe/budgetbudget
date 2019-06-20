import { ipcMain } from 'electron';
import { MONEY_MONEY_API_IPC_CHANNEL as CHANNEL } from '../../shared/constants';
import { server } from '../../shared/ipc';
import { AllMessages } from '../../shared/MoneyMoneyApiTypes';
import * as handlers from './handlers';

export default () => {
  server<AllMessages>(CHANNEL, ipcMain, handlers);
};
