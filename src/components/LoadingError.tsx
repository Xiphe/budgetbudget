import React from 'react';
import {
  cleanMessage,
  isDatabaseLocked,
  cantFindMoneyMoney,
} from '../moneymoney';
import { ipcRenderer, shell } from '../lib';
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
          onClick={() => shell.openExternal('https://moneymoney-app.com/')}
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
