import './theme.scss';
import React, { Suspense, useState, useCallback } from 'react';
import classNames from 'classnames';
import { RecoilRoot } from 'recoil';
import { INIT_EMPTY, BudgetState, InitRes, getInitData } from './budget';
import { ErrorBoundary, Startup } from './components';
import styles from './App.module.scss';
import { useRetryResource } from './lib';

const Budget = React.lazy(() => import('./views/Budget'));
const Welcome = React.lazy(() => import('./views/Welcome'));
const NewBudget = React.lazy(() => import('./views/NewBudget'));

function App({ initRes }: { initRes: InitRes }) {
  const [initialState, setInitialState] = useState<
    typeof INIT_EMPTY | BudgetState
  >(initRes.read());
  const [welcome, setWelcome] = useState<boolean>(
    window.location.hash !== '#new',
  );

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
  const [initRes, setInitRes] = useState(initialInitRes);
  const retryInitRes = useRetryResource(
    initRes,
    useCallback(() => setInitRes(getInitData()), []),
  );
  return (
    <div
      className={classNames(
        styles.app,
        process.env.REACT_APP_ENV === 'test' && styles.appTest,
      )}
    >
      <RecoilRoot>
        <Suspense fallback={<Startup />}>
          <ErrorBoundary>
            <App initRes={retryInitRes} />
          </ErrorBoundary>
        </Suspense>
      </RecoilRoot>
    </div>
  );
}
