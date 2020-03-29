import React, { ReactNode } from 'react';
import styles from './Content.module.scss';

type Props = {
  children: ReactNode;
};
export default function Content({ children }: Props) {
  return <div className={styles.content}>{children}</div>;
}
