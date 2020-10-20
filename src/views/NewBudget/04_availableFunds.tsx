import React from 'react';
import cx from 'classnames';

import SingleBudget from './components/SingleBudget';
import { Step } from './Types';
import styles from './NewBudget.module.scss';

const AvailableFunds: Step = {
  title: 'Fill Categories',
  initialOk() {
    return true;
  },
  Comp(props) {
    return (
      <>
        <SingleBudget {...props} small />
        <div className={cx(styles.explainBody, styles.explainSpaceS)}>
          <h1 className={styles.center}>Setup Income Categories</h1>
        </div>
      </>
    );
  },
};

export default AvailableFunds;
