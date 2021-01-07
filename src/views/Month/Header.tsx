import React, { FC } from 'react';
import { useRegisterHeader } from '../../lib';
import styles from './Month.module.scss';

const Header: FC = ({ children }) => {
  const registerHeader = useRegisterHeader();

  return (
    <header className={styles.header}>
      <div ref={registerHeader}>
        {children}
        <hr className={styles.headerBorder} />
      </div>
    </header>
  );
};

export default Header;
