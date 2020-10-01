import React, { HTMLAttributes } from 'react';
import cx from 'classnames';
import styles from './Container.module.scss';

type Props = HTMLAttributes<HTMLDivElement>;
export default function Container({ className, ...rest }: Props) {
  return <div className={cx(className, styles.container)} {...rest}></div>;
}
