import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useInputProps } from '../../../lib';
import { Loading, LoadingError } from '../../../components';
import { useAccounts } from '../../../moneymoney';
import styles from '../Settings.module.scss';
import { Props } from './Types';
import { ACTION_SETTINGS_SET_SELECTED_ACCOUNTS } from '../../../budget';
import { Account } from '../../../moneymoney/Types';

export default function AccountSettings({
  dispatch,
  state: {
    settings: { accounts, currency },
  },
}: Props) {
  const { value, onChange, error, ...rest } = useInputProps({
    internal: false,
    value: accounts,
    onChange: useCallback(
      (payload: string[]) => {
        dispatch({ type: ACTION_SETTINGS_SET_SELECTED_ACCOUNTS, payload });
      },
      [dispatch],
    ),
    validate: useCallback(
      ({ target: { value } }: { target: { value: string[] } }, setError) => {
        if (value.length === 0) {
          setError('Please select at least one account');
        }

        return value;
      },
      [],
    ),
  });
  const [currentLoadedAccounts, setCurrentLoadedAccounts] = useState<
    Account[] | null
  >(null);
  const [allAccounts, retry] = useAccounts(currency);
  useEffect(() => {
    if (allAccounts instanceof Error) {
      return;
    }
    if (currentLoadedAccounts === null) {
      setCurrentLoadedAccounts(allAccounts);
    } else if (allAccounts !== currentLoadedAccounts) {
      setCurrentLoadedAccounts(allAccounts);
      onChange({ target: { value: [] } });
    }
  }, [currentLoadedAccounts, allAccounts, onChange]);

  if (!allAccounts) {
    return <Loading />;
  }

  if (allAccounts instanceof Error) {
    return (
      <LoadingError
        className={styles.loadingError}
        message={allAccounts.message}
        retry={retry}
      />
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
