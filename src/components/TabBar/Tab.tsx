import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './TabBar.module.scss';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role'> & {
  active: boolean;
};

export default function Tab({ children, className, active, ...rest }: Props) {
  return (
    <button
      role="tab"
      className={classNames(className, styles.tab, active && styles.activeTab)}
      {...rest}
    >
      {children}
    </button>
  );
}
