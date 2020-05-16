import React, { useCallback, Suspense } from 'react';
import { useAmountInputProps, NumberFormatter } from '../../../lib';
import { ACTION_SETTINGS_SET_START_BALANCE } from '../../../budget';
import { Button } from '../../../components';
import Input from '../Input';
import Setting from '../Setting';
import styles from '../Settings.module.scss';
import { Props } from './Types';
import { useTransactions, useAccounts } from '../../../moneymoney';

function RecalculateButton({
  settings: { currency, accounts },
  update,
}: {
  settings: Props['state']['settings'];
  update: (payload: number) => void;
}) {
  const allAccounts = useAccounts().read(currency);
  const transactions = useTransactions().read();
  const recalculate = useCallback(() => {
    const transactionsSum = transactions.reduce(
      (memo, { amount }) => memo + amount,
      0,
    );
    const accountsSum = allAccounts.reduce(
      (memo, { balance, uuid }) =>
        accounts.includes(uuid) ? memo + balance : memo,
      0,
    );
    update(accountsSum + transactionsSum * -1);
  }, [allAccounts, transactions, update, accounts]);

  return (
    <Button className={styles.recalculateButton} onClick={recalculate}>
      Re-Calculate
    </Button>
  );
}

export default function StartBalanceSetting({
  state: { settings },
  dispatch,
  numberFormatter,
}: Props & {
  numberFormatter: NumberFormatter;
}) {
  const update = useCallback(
    (payload: number) => {
      dispatch({ type: ACTION_SETTINGS_SET_START_BALANCE, payload });
    },
    [dispatch],
  );
  const inputProps = useAmountInputProps({
    value: settings.startBalance,
    numberFormatter,
    onChange: update,
  });

  return (
    <Setting label="Starting Balance" id="setting-start-balace">
      <Input
        id="setting-start-balace"
        {...inputProps}
        type="text"
        placeholder={`${numberFormatter.format(0)}, ${numberFormatter.format(
          -1234.56,
        )}, ...`}
      />
      <Suspense
        fallback={
          <Button disabled={true} className={styles.recalculateButton}>
            Re-Calculate
          </Button>
        }
      >
        <RecalculateButton settings={settings} update={update} />
      </Suspense>
    </Setting>
  );
}
