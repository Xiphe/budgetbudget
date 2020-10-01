import React, { SelectHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Select.module.scss';

type Props = SelectHTMLAttributes<HTMLSelectElement> & { margin?: boolean };

export default function Select({ className, margin = true, ...rest }: Props) {
  return (
    <span
      className={classNames(className, styles.select, margin && styles.margin)}
    >
      <select {...rest} />
    </span>
  );
}
