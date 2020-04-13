import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Content.module.scss';

type Props = {
  header?: ReactNode;
  children: ReactNode;
  padding?: boolean;
};
export default function Content({ header, children, padding }: Props) {
  return (
    <>
      {header}
      <div
        className={classNames(
          styles.content,
          padding && styles.padding,
          header && styles.withHeader,
        )}
      >
        {children}
      </div>
    </>
  );
}
