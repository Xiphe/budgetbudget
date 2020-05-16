import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useInputProps } from '../../../lib';
import styles from '../Settings.module.scss';
import { Props } from './Types';
import { ACTION_SETTINGS_SET_SELECTED_ACCOUNTS } from '../../../budget';
import { useAccounts } from '../../../moneymoney';

export default function AccountSettings({
  dispatch,
  state: {
    settings: { accounts, currency },
  },
}: Props) {
  const allAccounts = useAccounts().read(currency);
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
