import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Content.module.scss';

type Props = {
  children: ReactNode;
  padding?: boolean;
};
export default function Content({ children, padding }: Props) {
  return (
    <div className={classNames(styles.content, padding && styles.padding)}>
      {children}
    </div>
  );
}
