import React, { useCallback } from 'react';
import classNames from 'classnames';
import { ipcRenderer, useInputProps } from '../../../lib';
import { Loading, Button } from '../../../components';
import {
  useAccounts,
  cleanMessage,
  isDatabaseLocked,
} from '../../../moneymoney';
import styles from '../Settings.module.scss';
import { Props } from './Types';
import { ACTION_SETTINGS_SET_SELECTED_ACCOUNTS } from '../../../budget';

export default function AccountSettings({
  dispatch,
  state: {
    settings: { accounts, currency },
  },
}: Props) {
  const { value, onChange, error, ...rest } = useInputProps({
    value: accounts,
    onChange: useCallback(
      (payload: string[]) => {
        dispatch({ type: ACTION_SETTINGS_SET_SELECTED_ACCOUNTS, payload });
      },
      [dispatch],
    ),
    validate: useCallback(
      ({ target: { value } }: { target: { value: string[] } }) => {
        if (value.length === 0) {
          throw new Error('Please select at least one account');
        }

        return value;
      },
      [],
    ),
  });
  const [allAccounts, retry] = useAccounts(currency);

  if (!allAccounts) {
    return <Loading />;
  }

  if (allAccounts instanceof Error) {
    return (
      <div>
        <p className={styles.accountsLoadingError}>
          {cleanMessage(allAccounts.message)}
        </p>
        {isDatabaseLocked(allAccounts.message) && (
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
        {allAccounts.length === 0 && (
          <p className={classNames(styles.error, styles.noAccountsError)}>
            None of your accounts are using this currency
          </p>
        )}
        {allAccounts.map(({ number, name }) => (
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
                      target: {
                        value: value.filter((n: string) => n !== number),
                      },
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
