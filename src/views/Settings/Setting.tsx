import React, { ReactNode } from 'react';
import styles from './Settings.module.scss';

type Props = {
  children: ReactNode;
  label?: string;
  id?: string;
};

export default function Setting({ children, label, id }: Props) {
  return (
    <div className={styles.setting}>
      {label ? (
        <label className={styles.label} htmlFor={id}>
          {label}:
        </label>
      ) : null}
      <div className={styles.inputWrap}>{children}</div>
    </div>
  );
}
