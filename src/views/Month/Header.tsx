import React, { FC } from 'react';
import cx from 'classnames';
import { useRegisterHeader, useMounted } from '../../lib';
import styles from './Month.module.scss';

const Header: FC = ({ children }) => {
  const registerHeader = useRegisterHeader();
  const mounted = useMounted();

  return (
    <header className={cx(styles.header, mounted && styles.headerMounted)}>
      <div ref={registerHeader}>
        {children}
        <hr className={styles.headerBorder} />
      </div>
    </header>
  );
};

export default Header;
