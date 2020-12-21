import React, {
  useEffect,
  useMemo,
  unstable_useTransition,
  useState,
} from 'react';
import cx from 'classnames';
import { Button } from '../../components';
import logo from '../../img/logo.png';
import { Step } from './Types';
import styles from './NewBudget.module.scss';
import { Account } from '../../moneymoney';
import { CurrencySetting, AccountSetting } from '../Settings';
import * as accountIcons from './accountIcons';
import { currencySign, useNumberFormatter } from '../../lib';

function ExamplaricAccount({
  balance,
  currency,
}: {
  balance: string | number;
  currency?: string;
}) {
  const numberFormatter = useNumberFormatter();
  return (
    <>
      <span className={cx(balance < 0 && styles.negative)}>
        {typeof balance === 'number'
          ? numberFormatter.format(balance)
          : balance}{' '}
      </span>{' '}
      {currency}
    </>
  );
}

const OnePot: Step = {
  title: 'The Treasure-Chest',
  initialOk() {
    return true;
  },
  Comp({ nextPage, moneyMoney, state, dispatch, setOk }) {
    const numberFormatter = useNumberFormatter();
    const [customizeAccounts, setCustomizeAccounts] = useState<boolean>(false);
    const accounts = moneyMoney.accounts.read();
    const currencies = moneyMoney.currencies.read();

    const {
      settings: { accounts: selectedAccounts, currency },
    } = state;
    const signedCurrency = currencySign(currency);
    useEffect(() => setOk(selectedAccounts.length !== 0), [
      setOk,
      selectedAccounts,
    ]);
    const [startTransition, transitioning] = unstable_useTransition({
      timeoutMs: 2000,
    });
    useEffect(() => {
      try {
        /* prefetch for next page */
        moneyMoney.categories.read();
      } catch (err) {
        /* ¯\_(ツ)_/¯ */
      }
    }, [moneyMoney]);

    const [exampleAccounts, balance] = useMemo((): [Account[], number] => {
      const realAccounts = accounts.filter(({ uuid }) =>
        selectedAccounts.includes(uuid),
      );
      const exampleAccounts: Account[] = [];
      if (realAccounts.length < 3) {
        exampleAccounts.push(...realAccounts);
      } else {
        const positive = realAccounts.filter(({ balance }) => balance > 0);
        const negative = realAccounts.filter(({ balance }) => balance < 0);
        const posAndNeg = positive.concat(negative);
        const other = realAccounts.filter(
          ({ uuid: otherId }) =>
            !posAndNeg.find(({ uuid }) => uuid === otherId),
        );

        while (exampleAccounts.length < 3) {
          if (!positive.length && !negative.length) {
            exampleAccounts.push(other.shift()!);
          }
          if (positive.length) {
            exampleAccounts.push(positive.shift()!);
          }
          if (negative.length) {
            exampleAccounts.push(negative.shift()!);
          }
        }
      }

      return [
        exampleAccounts,
        realAccounts.reduce((b, { balance }) => b + balance, 0),
      ];
    }, [accounts, selectedAccounts]);

    if (customizeAccounts) {
      return (
        <div
          className={cx(
            styles.explainWrap,
            styles.explainBody,
            styles.explainSpace,
          )}
        >
          <h1 className={styles.center}>
            Please select the accounts for this budget
          </h1>
          <div className={styles.twoCols}>
            <div>
              {currencies.length > 1 && (
                <CurrencySetting
                  state={state}
                  dispatch={dispatch}
                  moneyMoney={moneyMoney}
                />
              )}
              <AccountSetting
                state={state}
                dispatch={dispatch}
                moneyMoney={moneyMoney}
              />
            </div>
            <div>
              <p>&nbsp;</p>
              <p>
                The selected accounts have a total of{' '}
                <em className={cx(balance < 0 && styles.negative)}>
                  {numberFormatter.format(balance)}
                </em>{' '}
                {signedCurrency}{' '}
                {balance > 0
                  ? 'available for budgeting'
                  : 'as your starting point'}
              </p>
              {balance < 0 && (
                <p>
                  Don't worry about the negative starting balance, we'll make it
                  work!
                </p>
              )}
              {currencies.length > 1 && (
                <p>
                  This budget can only work with one currency, but you can
                  create other budgets for different currencies later.
                </p>
              )}
              <Button
                disabled={state.settings.accounts.length === 0}
                primary
                onClick={() => setCustomizeAccounts(false)}
              >
                Ok, {balance < 0 ? 'lets do this' : 'looks good now'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (!exampleAccounts.length) {
      return (
        <div
          className={cx(
            styles.explainWrap,
            styles.explainBody,
            styles.explainSpace,
          )}
        >
          <h1 className={styles.center}>Please create some accounts first</h1>
          <p className={styles.center}>
            It seems as if you don't have any accounts in MoneyMoney, please
            create some.
            <br />
            <br />
            <Button
              disabled={transitioning}
              onClick={() => startTransition(() => moneyMoney.refresh())}
            >
              Refresh MoneyMoney data
            </Button>
          </p>
        </div>
      );
    }

    return (
      <div className={cx(styles.explainWrap, styles.explainBody)}>
        <h1 className={styles.center}>
          Imagine putting all your Money in a treasure chest
        </h1>
        <div className={styles.embossVertical}>
          <div className={styles.treasuregramm}>
            <p>
              <span
                className={cx(
                  exampleAccounts[0].balance < 0 && styles.negative,
                )}
              >
                {numberFormatter.format(exampleAccounts[0].balance)}{' '}
              </span>{' '}
              {signedCurrency}
              <img src={exampleAccounts[0].icon} alt="account" />→
              <br />
              {exampleAccounts[2] ? (
                <>
                  <span
                    className={cx(
                      exampleAccounts[2].balance < 0 && styles.negative,
                    )}
                  >
                    {numberFormatter.format(exampleAccounts[2].balance)}{' '}
                  </span>{' '}
                  {signedCurrency}
                  <img src={exampleAccounts[2].icon} alt="account" />→
                </>
              ) : (
                <>
                  ...
                  <img src={accountIcons.One} alt="account" />→
                </>
              )}
            </p>
            <div className={styles.treasure}>
              <img src={logo} alt="treasure chest" />
            </div>
            <p>
              {exampleAccounts[1] ? (
                <>
                  ←<img src={exampleAccounts[1].icon} alt="account" />{' '}
                  <span
                    className={cx(
                      exampleAccounts[1].balance < 0 && styles.negative,
                    )}
                  >
                    {numberFormatter.format(exampleAccounts[1].balance)}
                  </span>{' '}
                  {signedCurrency}
                </>
              ) : (
                <>
                  ←<img src={accountIcons.Two} alt="account" />
                  ...
                </>
              )}
              <br />
              ←<img src={accountIcons.Three} alt="account" /> ...
            </p>
          </div>
          <p className={cx(balance < 0 && styles.negative, styles.treasureSum)}>
            <strong>{numberFormatter.format(balance)}</strong> {signedCurrency}
            {balance >= 0 ? ' to Budget' : ' Overbudgeted'}
          </p>
        </div>
        <div className={cx(styles.explainSpace, styles.twoCols)}>
          <div>
            <h3>
              <span role="img" aria-label="money">
                💰
              </span>{' '}
              Consider all your money
            </h3>
            <p>
              From a budget point of view it does not matter if your money is on{' '}
              <em>{exampleAccounts[0].name}</em>
              {exampleAccounts[1] ? (
                <>
                  , <em>{exampleAccounts[1].name}</em>{' '}
                </>
              ) : (
                ' '
              )}
              or any of your other accounts. It's your money and budgeting is
              about <strong>what to do with it</strong>, not where to keep it.
            </p>
          </div>
          <div>
            <h3>
              <span role="img" aria-label="suspicious look">
                🧐
              </span>{' '}
              Doesn't look right?
            </h3>
            <p>
              If{' '}
              <em className={cx(balance < 0 && styles.negative)}>
                {numberFormatter.format(balance)}
              </em>{' '}
              {signedCurrency} is not the total amount of money you've expected.
              You might want to take some of your accounts off the budget. For
              example if you also manage family or business accounts or have
              dedicated accounts for savings or debts.
            </p>
            <Button onClick={() => setCustomizeAccounts(true)}>
              Customize {currencies.length > 1 ? 'Currency and ' : ''}Accounts
            </Button>
          </div>
        </div>
        <br />
        <p className={styles.center}>
          <Button
            primary
            disabled={selectedAccounts.length === 0}
            onClick={() => nextPage()}
          >
            Set Purpose
          </Button>
        </p>
      </div>
    );
  },
};

export default OnePot;
