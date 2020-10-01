import React from 'react';
import styles from './CategorySidebar.module.scss';

type Props = {
  title: string;
};

export default function SidebarHeader({ title }: Props) {
  return (
    <div className={styles.sidebarHeader}>
      <h3>{title}</h3>
    </div>
  );
}
