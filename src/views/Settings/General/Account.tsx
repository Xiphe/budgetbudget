import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useInputProps, isError } from '../../../lib';
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
    if (isError(allAccounts)) {
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

  if (isError(allAccounts)) {
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
        {allAccounts.map(
          ({ uuid, name, indentation, group, portfolio, icon }) => (
            <li key={uuid} style={{ '--indentation': indentation } as any}>
              {group ? (
                <span className={styles.accountListEntry}>
                  <img src={icon} alt="" className={styles.accountListIcon} />
                  {name}
                </span>
              ) : (
                <label
                  className={classNames(
                    styles.accountListEntry,
                    portfolio && styles.disabledCheckbox,
                  )}
                >
                  <input
                    type="checkbox"
                    disabled={portfolio}
                    checked={value.includes(uuid)}
                    onChange={() => {
                      const i = value.indexOf(uuid);
                      if (i === -1) {
                        onChange({ target: { value: value.concat(uuid) } });
                      } else {
                        onChange({
                          target: {
                            value: value.filter((n: string) => n !== uuid),
                          },
                        });
                      }
                    }}
                    {...rest}
                  />
                  <img src={icon} alt="" className={styles.accountListIcon} />
                  {name}
                </label>
              )}
            </li>
          ),
        )}
      </ul>
      {error && <p className={styles.error}>{error}</p>}
    </>
  );
}
