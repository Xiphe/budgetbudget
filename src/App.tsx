import './theme.scss';
import React, { Suspense, useState } from 'react';
import { getInitData, INIT_EMPTY } from './budget';
import { ErrorBoundary, Startup } from './components';
import styles from './App.module.scss';
import { BudgetState } from './budget/Types';

const Budget = React.lazy(() => import('./views/Budget'));
const Welcome = React.lazy(() => import('./views/Welcome'));
const NewBudget = React.lazy(() => import('./views/NewBudget'));

const initRes = getInitData();

function App() {
  const init = initRes.read();
  const [welcome, setWelcome] = useState<boolean>(true);
  const [initialState, setInitialState] = useState<
    typeof INIT_EMPTY | BudgetState
  >(init);

  return initialState === INIT_EMPTY ? (
    welcome ? (
      <Welcome onCreate={() => setWelcome(false)} />
    ) : (
      <NewBudget onCreate={setInitialState} />
    )
  ) : (
    <Budget initialState={initialState} />
  );
}

export default function AppWrapper() {
  return (
    <div className={styles.app}>
      <ErrorBoundary>
        <Suspense fallback={<Startup />}>
          <App />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
