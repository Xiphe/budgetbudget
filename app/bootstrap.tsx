import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { ErrorBoundary } from './lib/components';

render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById('root'),
);
