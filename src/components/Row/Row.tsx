import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Row.module.scss';

type Props = {
  indent?: number;
  leaf?: boolean;
  children?: ReactNode;
  className?: string;
};
export default function Row({
  indent = 0,
  leaf = false,
  children,
  className,
}: Props) {
  return (
    <div
      style={{ '--indent': indent } as any}
      className={classNames(className, styles.row, leaf && styles.leaf)}
    >
      {children}
    </div>
  );
}
