import React, { Dispatch, useState } from 'react';
import { Helmet } from 'react-helmet';
import { BudgetState, Action } from '../../budget';
import { Content, Tab, TabBar } from '../../components';
import { appName, useSetShowSettings } from '../../lib';
import styles from './Settings.module.scss';
import General from './General';
import Categories from './Categories';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<Action>;
};

export default function Settings(props: Props) {
  const showSettings = useSetShowSettings();
  const [tab, setTab] = useState<'general' | 'categories'>('general');
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
        onClick={() => showSettings && showSettings(false)}
      >
        ✕
      </button>
      <TabBar>
        <Tab active={tab === 'general'} onClick={() => setTab('general')}>
          General
        </Tab>
        <Tab active={tab === 'categories'} onClick={() => setTab('categories')}>
          Categories
        </Tab>
      </TabBar>
      {tab === 'general' && <General {...props} />}
      {tab === 'categories' && <Categories {...props} />}
    </Content>
  );
}
