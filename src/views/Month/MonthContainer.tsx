import React from 'react';
import { Loading } from '../../components';
import { useIsVisible } from '../../lib';
import Header from './Header';
import Overview from './Overview';
import Categories from './Categories';
import { Props } from './Types';
import styles from './Month.module.scss';
import useActions from './useActions';

export default function MonthContainer({ budget, ...rest }: Props) {
  const isVisible = useIsVisible();
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => isVisible(ref.current!, setVisible), [isVisible]);
  const actions = useActions(rest);

  return (
    <div ref={ref} className={styles.month}>
      <div>
        <Header>
          {visible ? <Overview {...rest} budget={budget} /> : <Loading />}
        </Header>
        {visible ? (
          <Categories
            {...rest}
            budgetCategories={budget.categories}
            actions={actions}
          />
        ) : null}
      </div>
    </div>
  );
}
