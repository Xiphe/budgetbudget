import React, { ReactNode } from 'react';
import styles from './TabBar.module.scss';

type Props = {
  children: ReactNode;
};
export default function TabBar({ children }: Props) {
  return <div className={styles.tabBar}>{children}</div>;
}
