import { useMemo, useCallback, Dispatch } from 'react';
import {
  getTransactions,
  TransactionsResource,
  filterCurrency,
} from './getTransactions';
import {
  getCategories,
  CategoryResource,
  splitCurrencyCategories,
} from './getCategories';
import {
  AccountsResource,
  filterAccounts,
  getAccounts,
  getCurrencies,
} from './getAccounts';
import {
  ACTION_SETTINGS_SET_CURRENCY,
  ACTION_SETTINGS_SET_SELECTED_ACCOUNTS,
  ACTION_SETTINGS_SET_START_DATE,
  BudgetState,
} from '../budget';
import {
  createHOR,
  createResource,
  Resource,
  withRetry,
  AppAction,
} from '../lib';
import { Category, InteropAccount, Transaction } from './Types';

export const ACTION_MM_REFRESH = Symbol('ACTION_MM_REFRESH');
type RefreshMoneyMoneyAction = { type: typeof ACTION_MM_REFRESH };
export type MoneyMoneyAction = RefreshMoneyMoneyAction;

export type MoneyMoneyRes = {
  categories: CategoryResource;
  transactions: TransactionsResource;
  accounts: AccountsResource;
  currencies: Resource<string[]>;
  refresh: () => void;
};

type RequiredSettings = Pick<
  BudgetState['settings'],
  'accounts' | 'currency' | 'startDate'
>;

export type BaseMoneyMoneyRes = {
  settings: RequiredSettings;
  baseAccountsRes: Resource<InteropAccount[]>;
  baseCategoriesRes: Resource<Category[]>;
  baseTransactionsRes: Resource<Transaction[]>;
};

function createTransactionsRes(settings: RequiredSettings) {
  return createResource(
    () => getTransactions(settings.accounts, settings.startDate),
    {
      lazy: true,
    },
  );
}

export function moneyMoneyReducer(
  state: BaseMoneyMoneyRes,
  action: AppAction,
): BaseMoneyMoneyRes {
  switch (action.type) {
    case ACTION_MM_REFRESH:
      return {
        ...state,
        baseAccountsRes: state.baseAccountsRes.recreate(),
        baseCategoriesRes: state.baseCategoriesRes.recreate(),
        baseTransactionsRes: state.baseTransactionsRes.recreate(),
      };
    case ACTION_SETTINGS_SET_CURRENCY:
      return {
        ...state,
        settings: {
          ...state.settings,
          currency: action.payload,
        },
      };
    case ACTION_SETTINGS_SET_SELECTED_ACCOUNTS: {
      const newSettings = {
        ...state.settings,
        accounts: action.payload,
      };
      return {
        ...state,
        settings: newSettings,
        baseTransactionsRes: createTransactionsRes(newSettings),
      };
    }
    case ACTION_SETTINGS_SET_START_DATE: {
      if (action.payload === state.settings.startDate) {
        return state;
      }
      const newSettings = {
        ...state.settings,
        startDate: action.payload,
      };
      return {
        ...state,
        settings: newSettings,
        baseTransactionsRes: createTransactionsRes(newSettings),
      };
    }
    default:
      return state;
  }
}

export function useMoneyMoney(
  {
    settings: { currency },
    baseAccountsRes,
    baseCategoriesRes,
    baseTransactionsRes,
  }: BaseMoneyMoneyRes,
  dispatch: Dispatch<MoneyMoneyAction>,
) {
  const refresh = useCallback(() => dispatch({ type: ACTION_MM_REFRESH }), [
    dispatch,
  ]);
  const allAccountsRes = useMemo(() => {
    return createHOR(baseAccountsRes, withRetry(refresh));
  }, [baseAccountsRes, refresh]);
  const filteredAccountsRes = useMemo(() => {
    return createHOR(allAccountsRes, (res) => () =>
      filterAccounts(currency, res.read()),
    );
  }, [currency, allAccountsRes]);
  const currenciesRes = useMemo(() => {
    return createHOR(allAccountsRes, (res) => () => getCurrencies(res.read()));
  }, [allAccountsRes]);

  const splitCategoriesRes = useMemo(() => {
    const retryRes = createHOR(baseCategoriesRes, withRetry(refresh));
    return createHOR(retryRes, (res) => () =>
      splitCurrencyCategories(currency, res.read()),
    );
  }, [currency, baseCategoriesRes, refresh]);

  const filteredTransactionsRes = useMemo(() => {
    const retryRes = createHOR(baseTransactionsRes, withRetry(refresh));
    return createHOR(retryRes, (res) => () =>
      filterCurrency(currency, res.read()),
    );
  }, [currency, baseTransactionsRes, refresh]);

  return useMemo(
    (): MoneyMoneyRes => ({
      accounts: filteredAccountsRes,
      categories: splitCategoriesRes,
      transactions: filteredTransactionsRes,
      currencies: currenciesRes,
      refresh,
    }),
    [
      filteredAccountsRes,
      splitCategoriesRes,
      filteredTransactionsRes,
      currenciesRes,
      refresh,
    ],
  );
}

export function createInitialBaseMoneyMoneyState(
  view: 'budget' | 'settings' | 'new',
  settings: RequiredSettings,
): BaseMoneyMoneyRes {
  const init: BaseMoneyMoneyRes = {
    settings,
    baseAccountsRes: createResource(() => getAccounts(), { lazy: true }),
    baseCategoriesRes: createResource(() => getCategories(), { lazy: true }),
    baseTransactionsRes: createTransactionsRes(settings),
  };

  try {
    switch (view) {
      case 'budget':
        init.baseCategoriesRes.read();
        init.baseTransactionsRes.read();
        break;
      case 'settings':
        init.baseAccountsRes.read();
        break;
      // case 'new':
    }
  } catch (err) {
    /* ¯\_(ツ)_/¯ */
  }

  return init;
}
