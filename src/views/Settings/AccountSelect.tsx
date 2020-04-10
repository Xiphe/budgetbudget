import React, { InputHTMLAttributes } from 'react';
import { ipcRenderer } from '../../lib';
import { Loading, Button } from '../../components';
import { useAccounts } from '../../moneymoney';
import styles from './Settings.module.scss';

function cleanMessage(message: string) {
  const match = message.match(/Error invoking remote method .* Error: (.*)/);
  if (match) {
    return match[1];
  }
  return message;
}
function isDatabaseLocked(message: string) {
  return message.includes('MoneyMoney database is locked');
}

type AccountSelectProps = {
  value: string[];
  error?: string | null;
  onChange: (ev: { target: { value: string[] } }) => void;
} & Pick<InputHTMLAttributes<HTMLInputElement>, 'onFocus' | 'onBlur'>;
export default function AccountSelect({
  value,
  onChange,
  error,
  ...rest
}: AccountSelectProps) {
  const [accounts, retry] = useAccounts();

  if (!accounts) {
    return <Loading />;
  }

  if (accounts instanceof Error) {
    return (
      <div>
        <p className={styles.accountsLoadingError}>
          {cleanMessage(accounts.message)}
        </p>
        {isDatabaseLocked(accounts.message) && (
          <Button onClick={() => ipcRenderer.send('MM_OPEN')}>
            Open MoneyMoney
          </Button>
        )}
        <Button onClick={retry} primary>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className={styles.accountList}>
        {accounts.map(({ number, name }) => (
          <li key={number}>
            <label>
              <input
                type="checkbox"
                checked={value.includes(number)}
                onChange={() => {
                  const i = value.indexOf(number);
                  if (i === -1) {
                    onChange({ target: { value: value.concat(number) } });
                  } else {
                    onChange({
                      target: { value: value.filter((n) => n !== number) },
                    });
                  }
                }}
                {...rest}
              />
              {name}
            </label>
          </li>
        ))}
      </ul>
      {error && <p className={styles.error}>{error}</p>}
    </>
  );
}
