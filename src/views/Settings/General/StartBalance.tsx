import React, { useCallback, useState, useEffect } from 'react';
import { useAmountInputProps, NumberFormatter } from '../../../lib';
import { ACTION_SETTINGS_SET_START_BALANCE } from '../../../budget';
import { Button } from '../../../components';
import Input from '../Input';
import Setting from '../Setting';
import styles from '../Settings.module.scss';
import { Props } from './Types';
import {
  getAccounts,
  getTransactions,
  cleanMessage,
} from '../../../moneymoney';

function useReCalculate(
  accounts: string[],
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
        const [transactions, allAccounts] = await Promise.all([
          getTransactions(accounts, currency, startDate),
          getAccounts(currency),
        ]);
        const transactionsSum = transactions.reduce(
          (memo, { amount }) => memo + amount,
          0,
        );
        const accountsSum = allAccounts.reduce(
          (memo, { balance, number }) =>
            accounts.includes(number) ? memo + balance : memo,
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
  }, [loading, accounts, startDate, currency, update]);

  return [loading, recalculate];
}

export default function StartBalanceSetting({
  state: {
    settings: { startBalance, accounts, startDate, currency },
  },
  dispatch,
  numberFormatter,
}: Props & { numberFormatter: NumberFormatter }) {
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
    startDate,
    update,
    currency,
  );

  return (
    <Setting label="Starting Balance">
      <Input
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
      {loading instanceof Error ? (
        <p className={styles.error}>{cleanMessage(loading.message)}</p>
      ) : null}
    </Setting>
  );
}