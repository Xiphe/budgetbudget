import './theme.scss';
import React, { Suspense, useState } from 'react';
import { useInit, INIT_EMPTY } from './lib';
import { ErrorBoundary, Startup } from './components';
import styles from './App.module.scss';

const Budget = React.lazy(() => import('./views/Budget'));
const Welcome = React.lazy(() => import('./views/Welcome'));
const NewBudget = React.lazy(() => import('./views/NewBudget'));

export default function App() {
  const [welcome, setWelcome] = useState<boolean>(true);
  const [init, setInitialState] = useInit();
  return (
    <div className={styles.app}>
      <ErrorBoundary error={init instanceof Error ? init : undefined}>
        <Suspense fallback={<Startup />}>
          {!init ? (
            <Startup />
          ) : init instanceof Error ? null : init === INIT_EMPTY ? (
            welcome ? (
              <Welcome onCreate={() => setWelcome(false)} />
            ) : (
              <NewBudget onCreate={setInitialState} />
            )
          ) : (
            <Budget init={init} />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
