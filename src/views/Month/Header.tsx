import React, { FC } from 'react';
import styles from './Month.module.scss';

const Header: FC = ({ children }) => {
  return (
    <div className={styles.header}>
      {children}
      <hr className={styles.headerBorder} />
    </div>
  );
};

export default Header;
