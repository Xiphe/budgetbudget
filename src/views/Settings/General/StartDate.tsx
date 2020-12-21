import React, { useCallback, useMemo } from 'react';
import format from 'date-fns/format';
import { useInputProps, getToday } from '../../../lib';
import { ACTION_SETTINGS_SET_START_DATE } from '../../../budget';
import Input from '../Input';
import styles from '../Settings.module.scss';
import { Props } from './Types';

const timeStampToDate = (value: number) => format(value, 'yyyy-MM-dd');

export default function StartDateSetting({
  state: {
    settings: { startDate },
  },
  id,
  dispatch,
}: Props & { id?: string }) {
  const someDateString = useMemo(() => getToday().toLocaleDateString(), []);
  const inputProps = useInputProps({
    value: startDate,
    format: timeStampToDate,
    toInputFormat: timeStampToDate,
    onChange: useCallback(
      (payload: number) => {
        dispatch({ type: ACTION_SETTINGS_SET_START_DATE, payload });
      },
      [dispatch],
    ),
    validate: useCallback((ev) => {
      try {
        const date = new Date(ev.target.value).getTime();
        if (isNaN(date) || typeof date !== 'number') {
          throw new Error('invalid');
        }
        return date;
      } catch (err) {
        throw new Error('Please provide a valid date');
      }
    }, []),
  });

  return (
    <Input
      id={id}
      className={styles.dateInput}
      {...inputProps}
      type="date"
      placeholder={`${someDateString}, ...`}
    />
  );
}
