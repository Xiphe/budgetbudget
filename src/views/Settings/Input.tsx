import React, { InputHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Settings.module.scss';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: string | null;
};

export default function Input({ error, className, ...inputProps }: Props) {
  return (
    <>
      {
        <input
          className={classNames(className, styles.input)}
          {...inputProps}
        />
      }
      {error && <p className={styles.error}>{error}</p>}
    </>
  );
}
