import React, { ButtonHTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Button.module.scss';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
};
export default function Button({
  className,
  primary,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={classNames(
        className,
        styles.button,
        primary && styles.primary,
      )}
      {...rest}
    >
      <span>{children}</span>
    </button>
  );
}
