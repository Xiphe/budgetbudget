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
        moneyMoney.categories.read();
      } catch (err) {
        /* ¯\_(ツ)_/¯ */
      }
    }, [moneyMoney]);
    return (
      <div className={cx(styles.explainWrap, styles.explainBody)}>
        <h1 className={styles.center}>Hi and Welcome to BudgetBudget</h1>
        <div
          className={cx(
            styles.explainSpace,
            styles.personal,
            styles.embossVertical,
          )}
        >
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
          <h2 className={styles.center}>
            <span role="img" aria-label="lock">
              🔒
            </span>{' '}
            Some notes on Privacy and Security
          </h2>
          <div className={styles.explainCols}>
            <div>
              <h3>
                <span role="img" aria-label="eyes">
                  👀
                </span>{' '}
                Read only
              </h3>
              <p>
                The only <strong>write operation</strong> MoneyMoney allows
                other apps is adding transactions to Offline Accounts - and
                BudgetBudget won't do that.
              </p>
              <p>
                That means whatever happens in this App <strong>can not</strong>{' '}
                compromise your MoneyMoney data.
              </p>
            </div>
            <div>
              <h3>
                <span role="img" aria-label="mac">
                  💻
                </span>{' '}
                Offline
              </h3>
              <p>
                BudgetBudget only connects to the internet to automatically
                update itself. Your <strong>data stays on your mac</strong>{' '}
                unless you upload it yourself.
              </p>
              <p>
                I also do not collect usage statistics but instead hope that
                you'll write an email or open an issue if you encounter
                problems.
              </p>
            </div>
            <div>
              <h3>
                <span role="img" aria-label="document">
                  📄
                </span>{' '}
                Single files
              </h3>
              <p>
                A budget is a single un-encrypted file, you can have as many as
                you like and store them wherever you want.
              </p>
              <p>
                Budget files{' '}
                <strong>do not contain any transaction data</strong> - Only the
                amount of money you've budgeted and the settings.
              </p>
            </div>
          </div>
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
