import React, { HTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Row.module.scss';

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  indent?: number;
  leaf?: boolean;
  odd?: boolean;
  noPadding?: boolean;
  'data-row'?: never;
  groupClosed?: boolean;
};
export default function Row({
  indent = 0,
  leaf = false,
  noPadding = false,
  odd,
  groupClosed,
  className,
  ...rest
}: Props) {
  return (
    <div
      role="row"
      {...rest}
      data-row={leaf ? 'leaf' : 'group'}
      style={{ '--indent': indent } as any}
      className={classNames(
        className,
        styles.row,
        noPadding && styles.noPadding,
        !leaf && styles.group,
        odd && styles.odd,
        groupClosed && styles.groupClosed,
      )}
    />
  );
}
