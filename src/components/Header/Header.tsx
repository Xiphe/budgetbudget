import React, { ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Header.module.scss';

type Props = {
  className?: string;
  center?: boolean;
  children?: ReactNode;
};
export default function Header({ children, className, center }: Props) {
  return (
    <div
      className={classNames(
        className,
        styles.header,
        center && styles.trafficLightCounterSpacer,
      )}
    >
      <div className={styles.trafficLightSpacer} />
      {children}
    </div>
  );
}
export function HeaderSpacer() {
  return <div className={styles.spacer} />;
}
