import React, { ReactNode } from 'react';
import styles from './Settings.module.scss';

type Props = {
  children: ReactNode;
  label: String;
};

export default function Setting({ children, label }: Props) {
  return (
    <div className={styles.setting}>
      <label className={styles.label}>{label}:</label>
      <div className={styles.inputWrap}>{children}</div>
    </div>
  );
}
