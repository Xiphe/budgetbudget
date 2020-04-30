import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Row.module.scss';

type Props = {
  indent?: number;
  leaf?: boolean;
  odd?: boolean;
  children?: ReactNode;
  groupClosed?: boolean;
  className?: string;
};
export default function Row({
  indent = 0,
  leaf = false,
  children,
  odd,
  groupClosed,
  className,
}: Props) {
  return (
    <div
      style={{ '--indent': indent } as any}
      className={classNames(
        className,
        styles.row,
        !leaf && styles.group,
        odd && styles.odd,
        groupClosed && styles.groupClosed,
      )}
    >
      {children}
    </div>
  );
}
