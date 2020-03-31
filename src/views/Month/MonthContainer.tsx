import React from 'react';
import { Loading } from '../../components';
import Header from './Header';
import Overview, { Props } from './Overview';
import styles from './Month.module.scss';
import { useIsVisible } from '../../lib';

export default function MonthContainer(props: Props) {
  const isVisible = useIsVisible();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => isVisible(ref.current!, setVisible), [isVisible]);

  return (
    <div ref={ref} className={styles.month}>
      <Header>{visible ? <Overview {...props} /> : <Loading />}</Header>
      <div className={styles.body} />
    </div>
  );
}
