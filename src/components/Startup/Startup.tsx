import React from 'react';
import Content from '../Content';
import Header, { HeaderSpacer } from '../Header';
import Loading from '../Loading';
import styles from './Startup.module.scss';

export default function Startup() {
  return (
    <Content
      className={styles.startup}
      background
      header={
        <Header center>
          <HeaderSpacer />
          BudgetBudget
          <HeaderSpacer />
        </Header>
      }
    >
      <Loading center />
    </Content>
  );
}
