import './theme.scss';
import React, { Suspense, useState } from 'react';
import { useInit, INIT_EMPTY, isError } from './lib';
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
      <ErrorBoundary error={isError(init) ? init : undefined}>
        <Suspense fallback={<Startup />}>
          {!init ? (
            <Startup />
          ) : isError(init) ? null : init === INIT_EMPTY ? (
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
