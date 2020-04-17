import React from 'react';
import { Helmet } from 'react-helmet';
import { appName, shell } from '../../lib';
import { Content, Button } from '../../components';
import styles from './Welcome.module.scss';

type Props = {
  onCreate: () => void;
};
export default function Welcome({ onCreate }: Props) {
  return (
    <Content padding>
      <Helmet>
        <title>Welcome - {appName}</title>
      </Helmet>

      <h1 className={styles.center}>Welcome!</h1>
      <div className={styles.warning}>
        <h3>This is Alpha Software</h3>
        <p>
          Some quite essential features are still in development and there will
          be bugs!
        </p>
        <ol>
          <li>
            <h4>There is no auto-updater</h4>
            You need to check{' '}
            <button
              className={styles.linkButton}
              onClick={() =>
                shell.openExternal(
                  'https://github.com/Xiphe/budgetbudget/releases',
                )
              }
            >
              the releases page
            </button>{' '}
            yourself from time to time to get updates.
          </li>
          <li>
            <h4>There is no QA</h4>
            Things will break! I do not plan to invalidate the budget file
            format and hope that everything we budget from now on will stay
            valid until the app is stable. But no guarantees!
          </li>
        </ol>
      </div>
      <div className={styles.center}>
        <Button primary onClick={onCreate}>
          Ok, I understand. Create a new Budget
        </Button>
        <p>Or use the File menu to open an existing one</p>
      </div>
    </Content>
  );
}
