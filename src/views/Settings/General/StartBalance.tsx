import React, { useCallback, useState, useEffect } from 'react';
import { useAmountInputProps, NumberFormatter, isError } from '../../../lib';
import { ACTION_SETTINGS_SET_START_BALANCE } from '../../../budget';
import { Button } from '../../../components';
import Input from '../Input';
import Setting from '../Setting';
import styles from '../Settings.module.scss';
import { Props } from './Types';
import { getTransactions, cleanMessage, Account } from '../../../moneymoney';

function useReCalculate(
  accounts: string[],
  allAccounts: Account[],
  startDate: number,
  update: (value: number) => void,
  currency: string,
): [boolean | Error, () => void] {
  const [loading, setLoading] = useState<boolean | Error>(false);
  const recalculate = useCallback(() => {
    setLoading(true);
  }, []);
  useEffect(() => {
    let canceled = false;
    if (loading !== true) {
      return;
    }

    (async () => {
      try {
        const transactions = await getTransactions(
          accounts,
          currency,
          startDate,
        );
        const transactionsSum = transactions.reduce(
          (memo, { amount }) => memo + amount,
          0,
        );
        const accountsSum = allAccounts.reduce(
          (memo, { balance, uuid }) =>
            accounts.includes(uuid) ? memo + balance : memo,
          0,
        );
        if (!canceled) {
          update(accountsSum + transactionsSum * -1);
          setLoading(false);
        }
      } catch (err) {
        if (!canceled) {
          setLoading(err);
        }
      }
    })();

    return () => {
      canceled = true;
    };
  }, [loading, accounts, allAccounts, startDate, currency, update]);

  return [loading, recalculate];
}

export default function StartBalanceSetting({
  state: {
    settings: { startBalance, accounts, startDate, currency },
  },
  dispatch,
  numberFormatter,
  accountsRes,
}: Props & {
  numberFormatter: NumberFormatter;
}) {
  const allAccounts = accountsRes.read(currency);
  const update = useCallback(
    (payload: number) => {
      dispatch({ type: ACTION_SETTINGS_SET_START_BALANCE, payload });
    },
    [dispatch],
  );
  const inputProps = useAmountInputProps({
    value: startBalance,
    numberFormatter,
    onChange: update,
  });
  const [loading, recalculate] = useReCalculate(
    accounts,
    allAccounts,
    startDate,
    update,
    currency,
  );

  return (
    <Setting label="Starting Balance" id="setting-start-balace">
      <Input
        id="setting-start-balace"
        disabled={loading === true}
        {...inputProps}
        type="text"
        placeholder={`${numberFormatter.format(0)}, ${numberFormatter.format(
          -1234.56,
        )}, ...`}
      />
      <Button
        disabled={loading === true}
        className={styles.recalculateButton}
        onClick={recalculate}
      >
        Re-Calculate
      </Button>
      {isError(loading) ? (
        <p className={styles.error}>{cleanMessage(loading.message)}</p>
      ) : null}
    </Setting>
  );
}
