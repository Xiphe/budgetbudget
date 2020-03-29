import React from 'react';
import styles from './Month.module.scss';

type Props = {
  monthKey: string;
};
export default function Month({ monthKey }: Props) {
  return <div className={styles.month}>{monthKey}</div>;
}
