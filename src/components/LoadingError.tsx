import React from 'react';
import { cleanMessage, isDatabaseLocked } from '../moneymoney';
import { ipcRenderer } from '../lib';
import Button from './Button';

type Props = { className?: string; message: string; retry?: () => void };

export default function LoadingError({ className, message, retry }: Props) {
  return (
    <div className={className}>
      <p>{cleanMessage(message)}</p>
      {isDatabaseLocked(message) && (
        <Button className="openMM" onClick={() => ipcRenderer.send('MM_OPEN')}>
          Open MoneyMoney
        </Button>
      )}
      {retry && (
        <Button className="retry" onClick={retry} primary>
          Retry
        </Button>
      )}
    </div>
  );
}
