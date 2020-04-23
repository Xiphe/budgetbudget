import React from 'react';
import { remote, ipcRenderer } from 'electron';
import {
  cleanMessage,
  isDatabaseLocked,
  cantFindMoneyMoney,
} from '../moneymoney';
import Button from './Button';

type Props = { className?: string; message: string; retry?: () => void };

export default function LoadingError({ className, message, retry }: Props) {
  return (
    <div className={className}>
      <p>{cleanMessage(message)}</p>
      {isDatabaseLocked(message) && (
        <Button onClick={() => ipcRenderer.send('MM_OPEN')}>
          Open MoneyMoney
        </Button>
      )}
      {cantFindMoneyMoney(message) && (
        <Button
          onClick={() =>
            remote.shell.openExternal('https://moneymoney-app.com/')
          }
        >
          Goto MoneyMoney website
        </Button>
      )}
      {retry && (
        <Button onClick={retry} primary>
          Retry
        </Button>
      )}
    </div>
  );
}
