import React, { useCallback } from 'react';
import { ACTION_SETTINGS_SET_IGNORE_PENDING_TRANSACTIONS } from '../../../budget';
import Setting from '../Setting';
import { Props } from './Types';

export default function IgnorePendingTransactionsSetting({
  state: {
    settings: { ignorePendingTransactions },
  },
  dispatch,
}: Props) {
  const onChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({
        type: ACTION_SETTINGS_SET_IGNORE_PENDING_TRANSACTIONS,
        payload: ev.target.checked,
      });
    },
    [dispatch],
  );

  return (
    <Setting
      label="Ignore pending transactions"
      id="setting-ignore-pending-transactions"
    >
      <input
        type="checkbox"
        id="setting-ignore-pending-transactions"
        checked={ignorePendingTransactions}
        onChange={onChange}
      />
    </Setting>
  );
}
