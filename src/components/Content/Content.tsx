import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Content.module.scss';

type Props = {
  header: ReactNode;
  children: ReactNode;
  padding?: boolean;
  flex?: boolean;
  background?: boolean;
};
export default function Content({
  header,
  children,
  padding,
  background,
  flex,
}: Props) {
  return (
    <>
      {header}
      <div
        className={classNames(
          styles.content,
          padding && styles.padding,
          flex && styles.flex,
          background && styles.background,
        )}
      >
        {children}
      </div>
    </>
  );
}
