import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Content.module.scss';

type Props = {
  className?: string;
  header: ReactNode;
  children: ReactNode;
  padding?: boolean;
  flex?: boolean;
  scroll?: boolean;
  background?: boolean;
};
export default function Content({
  header,
  children,
  padding,
  background,
  className,
  flex,
  scroll,
}: Props) {
  return (
    <>
      {header}
      <div
        className={classNames(
          className,
          styles.content,
          padding && styles.padding,
          flex && styles.flex,
          scroll && styles.scroll,
          background && styles.background,
        )}
      >
        {children}
      </div>
    </>
  );
}
