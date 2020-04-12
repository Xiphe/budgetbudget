import React, { SelectHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Select.module.scss';

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className, ...rest }: Props) {
  return (
    <span className={classNames(className, styles.select)}>
      <select {...rest} />
    </span>
  );
}
