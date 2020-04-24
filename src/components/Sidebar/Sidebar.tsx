import React, { FC, MutableRefObject, HTMLAttributes } from 'react';
import classNames from 'classnames';
import styles from './Sidebar.module.scss';

type Props = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  innerRef?: MutableRefObject<HTMLDivElement | null>;
};
const Sidebar: FC<Props> = ({ children, className, innerRef, ...rest }) => {
  return (
    <div
      ref={innerRef}
      className={classNames(styles.sidebar, className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Sidebar;
