import React, { useEffect } from 'react';
import cx from 'classnames';
import { Button } from '../../components';

import { Step } from './Types';
import styles from './NewBudget.module.scss';
import me from '../../img/hannes_face.png';

const Welcome: Step = {
  title: 'Welcome',
  initialOk() {
    return true;
  },
  Comp({ nextPage, moneyMoney }) {
    useEffect(() => {
      try {
        /* prefetch for next page */
        moneyMoney.readCategories();
      } catch (err) {
        /* ¯\_(ツ)_/¯ */
      }
    }, [moneyMoney]);
    return (
      <div className={cx(styles.explainWrap, styles.explainBody)}>
        <h1 className={styles.center}>Hi and Welcome to BudgetBudget</h1>
        <div className={cx(styles.explainSpace, styles.personal)}>
          <img src={me} alt="Portrait of Hannes Diercks" />
          <div>
            <h2>I'm Hannes </h2>
            <p>
              I created this app for my personal needs and preferences and hope
              that it will also bring value to you.
              <br />
              If you're ever stuck or whish that this app would have some
              specific feature - please reach out to me. I want to make this
              awesome for everybody.
            </p>
          </div>
        </div>
        <div className={styles.explainSpace}>
          <h2 className={styles.center}>Some notes on Privacy and Security</h2>
          <div className={styles.explainCols}>
            <div>
              <h3>
                BudgetBudget operates <strong>read only</strong> on MoneyMoney.
              </h3>
              <p>
                In fact, the only <strong>write operation</strong> MoneyMoney
                provides to other apps is adding transactions to Offline
                Accounts - and BudgetBudget won't do that.
              </p>
              <p>
                That means whatever happens in this App <strong>can not</strong>{' '}
                compromise your MoneyMoney data.
              </p>
            </div>
            <div>
              <h3>Budgets are single files</h3>
              <p>
                You can have as many budget files as you like. BudgetBudget will
                not encrypt these files itself but it's quite easy to store them
                in a encrypted vault.
              </p>
              <p>
                Budget files <strong>do not store any financial data</strong>{' '}
                from MoneyMoney. They contain only the amount of money you've
                budgeted and the settings.
              </p>
            </div>
          </div>
          <p className={styles.center}>Explore and try things out!</p>
          <p className={styles.center}>
            <Button primary onClick={nextPage}>
              Let's get started
            </Button>
          </p>
        </div>
      </div>
    );
  },
};

export default Welcome;
