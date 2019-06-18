import React from 'react';
import { render } from 'react-dom';
import App from './App';
import {
  ErrorHandler,
  MoneyMoneyClientProvider,
} from './lib/components/providers';

render(
  <ErrorHandler>
    <MoneyMoneyClientProvider>
      <App />
    </MoneyMoneyClientProvider>
  </ErrorHandler>,
  document.getElementById('root'),
);
