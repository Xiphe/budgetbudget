import './theme.scss';
import React, {
  Suspense,
  useState,
  useCallback,
  ReactNode,
  Dispatch,
  SetStateAction,
  useMemo,
} from 'react';
import classNames from 'classnames';
import { ErrorBoundary, Startup } from './components';
import styles from './App.module.scss';
import {
  createHOR,
  InitialAppState,
  InitialAppData,
  Resource,
  useAppState,
  withRetry,
  createNewInitialAppState,
  initialAppStateRes,
  createResource,
  NumberFormatterProvider,
} from './lib';

const Welcome = React.lazy(() => import('./views/Welcome'));
const NewBudget = React.lazy(() => import('./views/NewBudget'));
const Main = React.lazy(() => import('./views/Main'));

function App(initData: InitialAppState) {
  const [view, setView] = useState(initData.view);
  const [budget, moneyMoney, dispatch] = useAppState(initData);
  const openBudget = useCallback(() => {
    setView('budget');
  }, [setView]);

  return (
    <NumberFormatterProvider fractionDigits={budget.settings.fractionDigits}>
      <ErrorBoundary>
        <Suspense fallback={<Startup />}>
          {((): ReactNode => {
            switch (view) {
              case 'new':
                return (
                  <NewBudget
                    state={budget}
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
                    state={budget}
                    dispatch={dispatch}
                    setView={setView}
                  />
                );
            }
          })()}
        </Suspense>
      </ErrorBoundary>
    </NumberFormatterProvider>
  );
}

type AppWelcomeSwitchProps = {
  initDataRes: Resource<InitialAppData>;
  setInitRes: Dispatch<SetStateAction<Resource<InitialAppData>>>;
};
function AppWelcomeSwitch({ initDataRes, setInitRes }: AppWelcomeSwitchProps) {
  const initData = initDataRes.read();
  const openNew = useCallback(() => {
    setInitRes(createResource(() => createNewInitialAppState()));
  }, [setInitRes]);

  switch (initData.view) {
    case 'welcome':
      return <Welcome onCreate={openNew} />;
    default:
      return <App {...initData} />;
  }
}

export default function AppWrapper() {
  const [initRes, setInitRes] = useState(initialAppStateRes);
  const initResWithRetry = useMemo(
    () => createHOR(initRes, withRetry(setInitRes)),
    [initRes],
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
          <AppWelcomeSwitch
            initDataRes={initResWithRetry}
            setInitRes={setInitRes}
          />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
