import React, { Dispatch, useState } from 'react';
import { BudgetState, BudgetAction } from '../../budget';
import { Content, Tab, TabBar, Header, Button } from '../../components';
import General from './General';
import Categories from './Categories';
import { MoneyMoneyRes } from '../../moneymoney';

type Props = {
  state: BudgetState;
  dispatch: Dispatch<BudgetAction>;
  moneyMoney: MoneyMoneyRes;
  onClose: () => void;
};

export default function Settings(props: Props) {
  const [tab, setTab] = useState<'general' | 'categories'>('general');

  const { accounts } = props.state.settings;
  const valid = accounts.length > 0;

  return (
    <Content
      padding
      background
      header={
        <Header>
          <Button title="close" disabled={!valid} onClick={props.onClose}>
            X
          </Button>
          Settings
        </Header>
      }
    >
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
