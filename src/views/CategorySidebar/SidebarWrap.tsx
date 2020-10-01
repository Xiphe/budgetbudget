import React, { ReactNode } from 'react';
import styles from './CategorySidebar.module.scss';

type Props = {
  children: ReactNode;
};

export default function SidebarWrap({ children }: Props) {
  return <div className={styles.sidebarWrap}>{children}</div>;
}
