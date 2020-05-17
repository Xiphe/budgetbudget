import React, { FC } from 'react';
import styles from './Month.module.scss';

const Header: FC = ({ children }) => {
  return (
    <header className={styles.header}>
      {children}
      <hr className={styles.headerBorder} />
    </header>
  );
};

export default Header;
