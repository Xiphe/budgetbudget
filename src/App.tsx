import './theme.scss';
import React, { Suspense, useState, useCallback, ReactNode } from 'react';
import classNames from 'classnames';
import {
  InitRes,
  getInitData,
  useBudgetReducer,
  initialInitDataRes,
} from './budget';
import { ErrorBoundary, Startup } from './components';
import styles from './App.module.scss';
import { useRetryResource } from './lib';
import { useMoneyMoney } from './moneymoney';

const Welcome = React.lazy(() => import('./views/Welcome'));
const NewBudget = React.lazy(() => import('./views/NewBudget'));
const Main = React.lazy(() => import('./views/Main'));

function App({ readInitialView }: { readInitialView: InitRes }) {
  const [initialView, initialState] = readInitialView();
  const [view, setView] = useState(initialView);
  const [moneyMoney, updateSettings] = useMoneyMoney();
  const [state, dispatch] = useBudgetReducer(initialState, updateSettings);
  const openBudget = useCallback(() => {
    setView('budget');
  }, []);
  const openNew = useCallback(() => {
    setView('new');
  }, []);

  return (
    <ErrorBoundary>
      <Suspense fallback={<Startup />}>
        {((): ReactNode => {
          switch (view) {
            case 'welcome':
              return <Welcome onCreate={openNew} />;
            case 'new':
              return (
                <NewBudget
                  state={state}
                  dispatch={dispatch}
                  onCreate={openBudget}
                  moneyMoney={moneyMoney}
                />
              );
            default:
              return (
                <Main
                  view={view}
                  moneyMoney={moneyMoney}
                  state={state}
                  dispatch={dispatch}
                  setView={setView}
                />
              );
          }
        })()}
      </Suspense>
    </ErrorBoundary>
  );
}

export default function AppWrapper() {
  const [readInit, setInitRes] = useState(() => initialInitDataRes);
  const retryReadInit = useRetryResource(
    readInit,
    useCallback(() => setInitRes(getInitData()), []),
  );

  return (
    <div
      className={classNames(
        styles.app,
        process.env.REACT_APP_ENV === 'test' && styles.appTest,
      )}
    >
      <Suspense fallback={<Startup />}>
        <ErrorBoundary>
          <App readInitialView={retryReadInit} />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
