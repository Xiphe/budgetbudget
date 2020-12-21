import React, {
  MutableRefObject,
  Suspense,
  useMemo,
  useRef,
  useState,
} from 'react';
import cx from 'classnames';
import {
  ErrorBoundary,
  Loading,
  RenderError,
  Sidebar,
  Button,
} from '../../components';
import logo from '../../img/logo.png';
import { SidebarHeader, SidebarWrap } from '../CategorySidebar';
import CategorySidebar from './components/CategorySidebar';
import SingleBudget from './components/SingleBudget';
import { Step, StepCompProps } from './Types';
import styles from './NewBudget.module.scss';
import { Title, ToBudget, HadTable, BudgetTotals } from '../Month/Overview';
import { MonthData, useBudgetData } from '../../budget';
import getYear from 'date-fns/getYear';
import format from 'date-fns/format';
import isSameMonth from 'date-fns/isSameMonth';
import { InterMonthData } from '../../budget/Types';
import { StartDateSetting } from '../Settings';
import { getToday } from '../../lib';

export function onlyBudgets(data: InterMonthData): InterMonthData {
  console.log({ data });
  return {
    ...data,
    total: {
      balance: data.total.budgeted,
      budgeted: data.total.budgeted,
      spend: 0,
    },
    categories: data.categories.map((cat) => ({
      ...cat,
      balance: cat.budgeted,
      spend: 0,
    })),
  };
}
function FirstMonthBudget(
  props: StepCompProps & {
    sidebarRef: MutableRefObject<HTMLDivElement | null>;
    budgetRef: MutableRefObject<HTMLDivElement | null>;
  },
) {
  const { months, categories } = useBudgetData(props.state, props.moneyMoney);
  const firstMonth = months[0];
  const month = useMemo((): MonthData => {
    return {
      ...firstMonth,
      get: () => onlyBudgets(firstMonth.get()),
    };
  }, [firstMonth]);

  return (
    <SingleBudget
      {...props}
      innerRef={props.budgetRef}
      month={month}
      categories={categories}
      syncScrollY={props.sidebarRef}
    >
      {(data) => (
        <>
          <Title>
            {month.name} {getYear(month.date)}
          </Title>
          <div className={styles.treasure}>
            <img src={logo} alt="treasure chest" />
          </div>
          {data && (
            <>
              <HadTable>
                <ToBudget toBudget={data.toBudget} />
              </HadTable>
              <BudgetTotals {...data.total} />
            </>
          )}
        </>
      )}
    </SingleBudget>
  );
}

const FirstMonth: Step = {
  title: 'Fill Categories',
  initialOk() {
    return true;
  },
  Comp(props) {
    const [showDateSetting, setShowDateSetting] = useState<boolean>(false);
    const sidebarRef = useRef<HTMLDivElement | null>(null);
    const budgetRef = useRef<HTMLDivElement | null>(null);
    const startDate = new Date(props.state.settings.startDate);

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
              <FirstMonthBudget
                {...props}
                sidebarRef={sidebarRef}
                budgetRef={budgetRef}
              />
            </Suspense>
          </ErrorBoundary>
          <div className={cx(styles.explainBody, styles.explainSpaceS)}>
            <h1 className={styles.center}>
              A Job for
              <br />
              your money
            </h1>
            <p>
              {isSameMonth(startDate, getToday()) ? (
                'For this current month '
              ) : (
                <>Jumping back to {format(startDate, 'LLLL yyyy')} </>
              )}
              the objective is now to assign all your money to categories.
            </p>
            <p>
              {!showDateSetting ? (
                <Button onClick={() => setShowDateSetting(true)}>
                  Use another start date
                </Button>
              ) : (
                <>
                  <label>
                    Start Date:{' '}
                    <StartDateSetting
                      state={props.state}
                      moneyMoney={props.moneyMoney}
                      dispatch={props.dispatch}
                    />{' '}
                    <Button onClick={() => setShowDateSetting(false)}>
                      OK
                    </Button>
                  </label>
                </>
              )}
            </p>

            <p>
              We want to see <strong>0 To Budget</strong>, meaning every cent
              we've put into the treasure chest now has a purpose.
            </p>
          </div>
        </div>
      </>
    );
  },
};

export default FirstMonth;
