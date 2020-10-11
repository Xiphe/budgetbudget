import { Dispatch, useEffect } from 'react';
import {
  ACTION_SETTINGS_SET_SELECTED_ACCOUNTS,
  BudgetState,
} from '../../budget';
import { Action } from '../../budget/budgetReducer';
import { getAccounts } from '../../moneymoney';

type Opts = Pick<BudgetState['settings'], 'currency' | 'accounts'> & {
  dispatch: Dispatch<Action>;
};

export default function useSelectAllAccounts({
  dispatch,
  currency,
  accounts,
}: Opts) {
  useEffect(() => {
    let canceled = false;
    getAccounts()
      .then((allAccounts) => {
        if (canceled) {
          return;
        }

        const selectedInCurrency = allAccounts.filter(
          ({ uuid, currency: accCurrency }) =>
            accounts.includes(uuid) && currency === accCurrency,
        );

        if (!selectedInCurrency.length) {
          dispatch({
            type: ACTION_SETTINGS_SET_SELECTED_ACCOUNTS,
            payload: allAccounts
              .filter(
                ({ portfolio, group, currency: accCurrency }) =>
                  !group && !portfolio && currency === accCurrency,
              )
              .map(({ uuid }) => uuid),
          });
        }
      })
      .catch(() => {
        /* ¯\_(ツ)_/¯ */
      });

    return () => {
      canceled = true;
    };
  }, [currency, accounts, dispatch]);
}
