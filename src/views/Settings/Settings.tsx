import React, { Dispatch } from 'react';
import { Helmet } from 'react-helmet';
import { BudgetState, Action } from '../../budget';
import { Content } from '../../components';
import { appName, useSetShowSettings } from '../../lib';
import styles from './Settings.module.scss';
import General from './General';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Settings(props: Props) {
  const showSettings = useSetShowSettings();
  const { accounts } = props.state.settings;
  const valid = accounts.length > 0;

  return (
    <Content padding={true}>
      <Helmet>
        <title>Settings - {appName}</title>
      </Helmet>
      <h1 className={styles.headline}>Settings</h1>
      <button
        title="close"
        disabled={!valid}
        className={styles.close}
        onClick={() => showSettings(false)}
      >
        ✕
      </button>
      <General {...props} />
    </Content>
  );
}
