import React from 'react';
import classNames from 'classnames';
import styles from './Loading.module.scss';

type Props = {
  center?: boolean;
};
export default function Loading({ center }: Props) {
  return (
    <div
      className={classNames(styles.lds, center && styles.center)}
      data-testid="loading-spinner"
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
