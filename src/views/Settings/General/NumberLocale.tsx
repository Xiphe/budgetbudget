import React, { useCallback } from 'react';
import { useInputProps } from '../../../lib';
import { ACTION_SETTINGS_SET_NUMBER_LOCALE } from '../../../budget';
import Input from '../Input';
import Setting from '../Setting';
import { Props } from './Types';

export default function NumberLocaleSetting({
  state: {
    settings: { numberLocale },
  },
  dispatch,
}: Props) {
  const inputProps = useInputProps({
    value: numberLocale,
    onChange: useCallback(
      (payload: string) => {
        dispatch({ type: ACTION_SETTINGS_SET_NUMBER_LOCALE, payload });
      },
      [dispatch],
    ),
    validate: useCallback((ev) => {
      if (ev.target.value === '') {
        throw new Error('Please enter a Language Tag');
      }
      try {
        new (Intl as any).Locale(ev.target.value);
      } catch (err) {
        throw new Error('Language Tag format seems to be invalid');
      }
      return ev.target.value;
    }, []),
  });

  return (
    <Setting label="Number format Locale" id="setting-number-locale">
      <Input
        {...inputProps}
        type="text"
        id="setting-number-locale"
        placeholder="en, de-AT, ..."
      />
    </Setting>
  );
}
