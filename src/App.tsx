import './theme.scss';
import React, {
  Suspense,
  useState,
  useCallback,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import classNames from 'classnames';
import {
  InitRes,
  getInitData,
  useBudgetReducer,
  initialInitDataRes,
  InitDataWithState,
} from './budget';
import { ErrorBoundary, Startup } from './components';
import styles from './App.module.scss';
import { useNumberFormatter, useRetryResource } from './lib';
import { useMoneyMoney } from './moneymoney';

const Welcome = React.lazy(() => import('./views/Welcome'));
const NewBudget = React.lazy(() => import('./views/NewBudget'));
const Main = React.lazy(() => import('./views/Main'));

function App(initData: InitDataWithState) {
  const [view, setView] = useState(initData.view);
  const [moneyMoney, updateSettings] = useMoneyMoney(initData.res);
  const [state, dispatch] = useBudgetReducer(initData.state, updateSettings);
  const numberFormatter = useNumberFormatter(state.settings.fractionDigits);
  const openBudget = useCallback(() => {
    setView('budget');
  }, [setView]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<Startup />}>
        {((): ReactNode => {
          switch (view) {
            case 'new':
              return (
                <NewBudget
                  numberFormatter={numberFormatter}
                  state={state}
                  dispatch={dispatch}
                  onCreate={openBudget}
                  moneyMoney={moneyMoney}
                />
              );
            default:
              return (
                <Main
                  numberFormatter={numberFormatter}
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

type AppWelcomeSwitchProps = {
  readInitialView: InitRes;
  setInitRes: Dispatch<SetStateAction<InitRes>>;
};
function AppWelcomeSwitch({
  readInitialView,
  setInitRes,
}: AppWelcomeSwitchProps) {
  const initData = readInitialView();
  const openNew = useCallback(() => {
    // setInitRes
    // setView('new');
  }, []);

  switch (initData.view) {
    case 'welcome':
      return <Welcome onCreate={openNew} />;
    default:
      return <App {...initData} />;
  }
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
          <AppWelcomeSwitch
            readInitialView={retryReadInit}
            setInitRes={setInitRes}
          />
        </ErrorBoundary>
      </Suspense>
    </div>
  );
}
