import React, { useCallback } from 'react';
import { useInputProps } from '../../../lib';
import { ACTION_SETTINGS_SET_CURRENCY } from '../../../budget';
import Input from '../Input';
import Setting from '../Setting';
import { Props } from './Types';

export default function CurrencySetting({
  state: {
    settings: { currency },
  },
  dispatch,
}: Props) {
  const inputProps = useInputProps({
    value: currency,
    onChange: useCallback(
      (payload: string) => {
        dispatch({ type: ACTION_SETTINGS_SET_CURRENCY, payload });
      },
      [dispatch],
    ),
    validate: useCallback((ev) => {
      if (ev.target.value.replace(/a-z/gi, '').length !== 3) {
        throw new Error('Please provide a ISO_4217 currency code');
      }
      return ev.target.value.toUpperCase();
    }, []),
  });

  return (
    <Setting label="Currency" id="setting-currency">
      <Input
        {...inputProps}
        type="text"
        id="setting-currency"
        placeholder="EUR, USD, ..."
      />
    </Setting>
  );
}
