import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Content.module.scss';
import ScrollbarDimensionProvider from '../ScrollBarDimensionProvider';

type Props = {
  className?: string;
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
  className,
  flex,
}: Props) {
  return (
    <>
      {header}
      <ScrollbarDimensionProvider
        className={classNames(
          className,
          styles.content,
          padding && styles.padding,
          flex && styles.flex,
          background && styles.background,
        )}
      >
        {children}
      </ScrollbarDimensionProvider>
    </>
  );
}
