import React, { useCallback, useMemo } from 'react';
import format from 'date-fns/format';
import { useInputProps } from '../../../lib';
import { ACTION_SETTINGS_SET_START_DATE } from '../../../budget';
import Input from '../Input';
import Setting from '../Setting';
import styles from '../Settings.module.scss';
import { Props } from './Types';

const timeStampToDate = (value: number) => format(value, 'yyyy-MM-dd');

export default function StartDateSetting({
  state: {
    settings: { startDate },
  },
  dispatch,
}: Props) {
  const someDateString = useMemo(() => new Date().toLocaleDateString(), []);
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
    <Setting label="Start Date">
      <Input
        className={styles.dateInput}
        {...inputProps}
        type="date"
        placeholder={`${someDateString}, ...`}
      />
    </Setting>
  );
}
