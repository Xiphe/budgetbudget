import React, {
  ComponentProps,
  ReactNode,
  Suspense,
  FC,
  unstable_useTransition,
  useEffect,
} from 'react';
import cx from 'classnames';
import {
  Button,
  ErrorBoundary,
  Loading,
  Sidebar,
  RenderError,
} from '../../components';
import { Category } from '../../moneymoney';

import { Step } from './Types';
import styles from './NewBudget.module.scss';
import CategorySidebar, { SidebarWrap } from '../CategorySidebar';
import { ipcRenderer } from 'electron';

const CatSidebar: Step['Comp'] = ({
  moneyMoney,
  dispatch,
  setOk,
  state: {
    settings: { collapsedCategories },
  },
}) => {
  const [categories] = (() => {
    /* Categories are also read by Further component.
       Errors are displayed there. */
    try {
      return moneyMoney.readCategories();
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }
      return [[] as Category[]];
    }
  })();
  const hasCats = categories.length;

  useEffect(() => {
    setOk(hasCats > 0);
  }, [setOk, hasCats]);

  return (
    <CategorySidebar
      dispatch={dispatch}
      categories={categories}
      collapsedCategories={collapsedCategories}
    />
  );
};

const HasCategories: FC<{
  yes?: ReactNode;
  no?: ReactNode;
  moneyMoney: ComponentProps<Step['Comp']>['moneyMoney'];
}> = ({ yes = null, no = null, moneyMoney }) => {
  const [categories] = moneyMoney.readCategories();

  if (categories.length) {
    return <>{yes}</>;
  }

  return <>{no}</>;
};

const openMMButton = (
  <Button onClick={() => ipcRenderer.send('MM_OPEN')}>Open MoneyMoney</Button>
);

const Welcome: Step = {
  title: 'Set up categories',
  initialOk() {
    return false;
  },
  Comp(props) {
    const [startTransition, transitioning] = unstable_useTransition({
      timeoutMs: 2000,
    });

    const refreshButton = (
      <Button
        disabled={transitioning}
        onClick={() => startTransition(() => props.moneyMoney.refresh())}
      >
        Refresh Categories
      </Button>
    );

    return (
      <>
        <SidebarWrap>
          <Suspense
            fallback={
              <Sidebar className={styles.flexCenter}>
                <Loading />
              </Sidebar>
            }
          >
            <CatSidebar {...props} />
          </Suspense>
        </SidebarWrap>
        <div className={cx(styles.explainBody, styles.explainSpace)}>
          <h1 className={styles.center}>Let's setup your categories</h1>

          <ErrorBoundary fallback={RenderError}>
            <Suspense
              fallback={
                <div className={cx(styles.flexCenter, styles.loadingMM)}>
                  <Loading />
                  <p>Loading Categories from MoneyMoney</p>
                </div>
              }
            >
              <HasCategories
                moneyMoney={props.moneyMoney}
                yes={
                  <>
                    <p>
                      Please review your categories and make sure there is one
                      for everything you spend money on.
                    </p>
                  </>
                }
                no={
                  <>
                    <h3>Seems like you don't have Categories, jet</h3>
                    <p>
                      Please add a category for everything you spend money on.
                    </p>
                  </>
                }
              />
              <h3>For Example:</h3>
              <ul>
                <li>Food</li>
                <li>Cloths</li>
                <li>Rent</li>
                <li>Entertainment</li>
                <li>...</li>
              </ul>
              <p>
                There is no golden rule on how detailed or or general this
                categories should be, but you can always adjust them as you go.
              </p>
              <HasCategories
                moneyMoney={props.moneyMoney}
                yes={
                  <>
                    <p>
                      Also make sure to have categories for future expenses like
                      vacations or investments you're saving for.
                    </p>
                    {refreshButton}
                    {openMMButton}
                    <Button primary onClick={props.nextPage}>
                      Next Step
                    </Button>
                  </>
                }
                no={
                  <>
                    {refreshButton}
                    {openMMButton}
                  </>
                }
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </>
    );
  },
};

export default Welcome;
