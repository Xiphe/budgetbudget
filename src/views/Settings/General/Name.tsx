import React, { useCallback } from 'react';
import { useInputProps } from '../../../lib';
import { ACTION_SET_NAME } from '../../../budget';
import Input from '../Input';
import { Props } from './Types';

export default function NameSetting({
  state: { name },
  id,
  dispatch,
}: Props & { id?: string }) {
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
    <Input
      {...inputProps}
      type="text"
      id={id}
      placeholder="Private, Family, Band, ..."
    />
  );
}
