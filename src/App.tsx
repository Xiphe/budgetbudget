import './theme.scss';
import React, { Suspense, useState } from 'react';
import { RecoilRoot } from 'recoil';
import { INIT_EMPTY, BudgetState, InitRes } from './budget';
import { ErrorBoundary, Startup } from './components';
import styles from './App.module.scss';
import { useRefreshResource } from './lib';

const Budget = React.lazy(() => import('./views/Budget'));
const Welcome = React.lazy(() => import('./views/Welcome'));
const NewBudget = React.lazy(() => import('./views/NewBudget'));

function App({ initRes }: { initRes: InitRes }) {
  const [initialState, setInitialState] = useState<
    typeof INIT_EMPTY | BudgetState
  >(initRes.read());
  const [welcome, setWelcome] = useState<boolean>(true);

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

export default function AppWrapper({
  initialInitRes,
}: {
  initialInitRes: InitRes;
}) {
  const [initRes] = useRefreshResource(initialInitRes);
  return (
    <div className={styles.app}>
      <RecoilRoot>
        <Suspense fallback={<Startup />}>
          <ErrorBoundary>
            <App initRes={initRes} />
          </ErrorBoundary>
        </Suspense>
      </RecoilRoot>
    </div>
  );
}
