import React, { TableHTMLAttributes } from 'react';
import cx from 'classnames';
import styles from './Table.module.scss';

export default function Table({
  className,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cx(className, styles.table)} {...props} />;
}
