import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Button.module.scss';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  noMargin?: boolean;
};
export default function Button({
  className,
  primary,
  noMargin,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={classNames(
        className,
        styles.button,
        primary && styles.primary,
        noMargin && styles.noMargin,
      )}
      {...rest}
    >
      <span>{children}</span>
    </button>
  );
}
