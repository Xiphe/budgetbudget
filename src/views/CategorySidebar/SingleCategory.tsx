import React from 'react';
import styles from './CategorySidebar.module.scss';

type Props = {
  icon?: string;
  name: string;
};

export default function SingleCategory({ icon, name }: Props) {
  return (
    <>
      {icon && (
        <span
          style={{ backgroundImage: `url(${icon})` }}
          className={styles.icon}
        />
      )}
      <span className={styles.title}>{name}</span>
    </>
  );
}
