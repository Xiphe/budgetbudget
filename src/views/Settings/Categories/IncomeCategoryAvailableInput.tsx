import React, { useCallback } from 'react';
import { useInputProps } from '../../../lib';
import { ACTION_SETTINGS_SET_INCOME_AVAILABLE_IN } from '../../../budget';
import { Props as P } from './Types';
import Input from '../Input';
import styles from './Categories.module.scss';

type Props = {
  dispatch: P['dispatch'];
  categoryId: number | null;
  value: number;
};

function validate({ target: { value } }: { target: { value: string } }) {
  const val = parseInt(value, 10);
  if (isNaN(val) || val < 0) {
    return 0;
  }
  return val;
}

export default function IncomeCategoryAvailableInput({
  value,
  dispatch,
  categoryId,
}: Props) {
  const inputProps = useInputProps({
    value,
    validate,
    onChange: useCallback(
      (value: number) => {
        dispatch({
          type: ACTION_SETTINGS_SET_INCOME_AVAILABLE_IN,
          payload: {
            categoryId,
            availableIn: value,
          },
        });
      },
      [dispatch, categoryId],
    ),
  });

  return (
    <Input
      {...inputProps}
      className={styles.availableInInput}
      type="number"
      min="0"
    />
  );
}
