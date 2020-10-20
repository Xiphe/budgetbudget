import React, { Suspense, useRef, useMemo } from 'react';
import cx from 'classnames';
import {
  ErrorBoundary,
  Loading,
  RenderError,
  Sidebar,
  Button,
} from '../../components';
import { SidebarHeader, SidebarWrap } from '../CategorySidebar';
import CategorySidebar from './components/CategorySidebar';
import SingleBudget from './components/SingleBudget';
import { Step } from './Types';
import styles from './NewBudget.module.scss';
import { createNumberFormatter } from '../../lib';

const IntroIncomeCats: Step = {
  title: 'Fill Categories',
  initialOk() {
    return true;
  },
  Comp(props) {
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const budgetRef = useRef<HTMLDivElement | null>(null);
    const { fractionDigits, numberLocale } = props.state.settings;
    const numberFormatter = useMemo(
      () => createNumberFormatter(fractionDigits, numberLocale),
      [fractionDigits, numberLocale],
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
            <SidebarHeader title="" />
            <CategorySidebar
              {...props}
              ignoreLoadingError={true}
              innerRef={sidebarRef}
              syncScrollY={budgetRef}
            />
          </Suspense>
        </SidebarWrap>

        <div className={cx(styles.explainWrap, styles.explainFlex)}>
          <ErrorBoundary
            fallback={RenderError}
            fallbackClassName={cx(
              styles.singleBudgetDimensions,
              styles.explainSpaceS,
            )}
          >
            <Suspense
              fallback={
                <div className={cx(styles.flexCenter, styles.singleBudgetWrap)}>
                  <Loading />
                </div>
              }
            >
              <SingleBudget
                {...props}
                innerRef={budgetRef}
                syncScrollY={sidebarRef}
              />
            </Suspense>
          </ErrorBoundary>
          <div className={cx(styles.explainBody, styles.explainSpaceS)}>
            <h1 className={styles.center}>Monthly Workflow</h1>
            <p>
              Each Month fill up the budget of each category with what you
              expect to spend that month.
            </p>
            <h3>When something is payed yearly:</h3>
            <p>
              break the sum down to a monthly rate that you budget each month so
              that you have the money available when the amount is due.
            </p>
            <h3>This Money is taken from "To Budget"</h3>
            <p>
              But currently there are{' '}
              <strong>{numberFormatter.format(0)}</strong> "Available Funds" and
              thereby no money available to budget.
            </p>
            <Button primary>Configure Available Funds</Button>
          </div>
        </div>
      </>
    );
  },
};

export default IntroIncomeCats;
