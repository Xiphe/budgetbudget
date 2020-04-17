import React, { useCallback } from 'react';
import { useInputProps } from '../../../lib';
import { ACTION_SET_NAME } from '../../../budget';
import Input from '../Input';
import Setting from '../Setting';
import { Props } from './Types';

export default function NameSetting({ state: { name }, dispatch }: Props) {
  const inputProps = useInputProps({
    value: name || '',
    onChange: useCallback(
      (payload: string) => {
        dispatch({ type: ACTION_SET_NAME, payload });
      },
      [dispatch],
    ),
    validate: useCallback((ev) => {
      if (ev.target.value === '') {
        throw new Error('Please provide a name for the Budget');
      }
      return ev.target.value;
    }, []),
  });

  return (
    <Setting label="Name">
      <Input {...inputProps} type="text" placeholder="Private, Band, ..." />
    </Setting>
  );
}
