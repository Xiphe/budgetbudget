import React, { useCallback } from 'react';
import { useInputProps } from '../../../lib';
import { ACTION_SETTINGS_SET_FRACTION_DIGITS } from '../../../budget';
import Input from '../Input';
import Setting from '../Setting';
import { Props } from './Types';

export default function FractionDigitsSetting({
  state: {
    settings: { fractionDigits },
  },
  dispatch,
}: Props) {
  const inputProps = useInputProps({
    value: fractionDigits,
    onChange: useCallback(
      (payload: number) => {
        dispatch({ type: ACTION_SETTINGS_SET_FRACTION_DIGITS, payload });
      },
      [dispatch],
    ),
    validate: useCallback((ev) => {
      const value = parseInt(ev.target.value, 10);
      if (value.toString() !== String(ev.target.value)) {
        throw new Error('Please enter a valid number');
      } else if (value < 0) {
        throw new Error('Please enter a positive number or 0');
      }

      return value;
    }, []),
  });

  return (
    <Setting label="Fraction Digits" id="setting-fraction-digits">
      <Input
        {...inputProps}
        type="number"
        id="setting-fraction-digits"
        min="0"
        placeholder="2, 3, ..."
      />
    </Setting>
  );
}
