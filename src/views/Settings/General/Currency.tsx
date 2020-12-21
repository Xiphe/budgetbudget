import React, { useCallback } from 'react';
import { ACTION_SETTINGS_SET_CURRENCY } from '../../../budget';
import Setting from '../Setting';
import { Props } from './Types';
import { Select } from '../../../components';

export default function CurrencySetting({
  state: {
    settings: { currency },
  },
  dispatch,
  moneyMoney,
}: Props) {
  const currencies = moneyMoney.currencies.read();
  const setCurrency = useCallback(
    (ev) => {
      dispatch({
        type: ACTION_SETTINGS_SET_CURRENCY,
        payload: ev.target.value,
      });
    },
    [dispatch],
  );

  return (
    <Setting label="Currency" id="setting-currency">
      <Select id="setting-currency" value={currency} onChange={setCurrency}>
        {currencies.map((currency) => (
          <option key={currency}>{currency}</option>
        ))}
      </Select>
    </Setting>
  );
}
