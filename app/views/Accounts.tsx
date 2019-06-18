import React from 'react';
import { useAccounts } from '../lib';

export default function Accounts() {
  const accounts = useAccounts();

  if (accounts instanceof Error) {
    return <div>Could not fetch accounts, sorry</div>;
  }

  if (!accounts) {
    return <div>loading...</div>;
  }

  return (
    <ul>
      {accounts.map(({ name, balance }) => {
        return <li key={name}>{name}</li>;
      })}
    </ul>
  );
}
