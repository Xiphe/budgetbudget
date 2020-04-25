import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Header.module.scss';

type Props = {
  className?: string;
  children?: ReactNode;
};
export default function Header({ children, className }: Props) {
  return (
    <div className={classNames(className, styles.header)}>
      <div className={styles.dim}>{children}</div>
    </div>
  );
}
