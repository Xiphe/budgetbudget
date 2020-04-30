import React from 'react';
import Content from '../Content';
import Header, { HeaderSpacer } from '../Header';
import Loading from '../Loading';

export default function Startup() {
  return (
    <Content
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
