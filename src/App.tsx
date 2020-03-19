import React from 'react';
import { getAccounts, getBalancesAndCategories } from './moneymoney';

getAccounts()
  .then(getBalancesAndCategories)
  .then(console.log, console.error);

export default function App() {
  return <h1>Hello</h1>;
}
