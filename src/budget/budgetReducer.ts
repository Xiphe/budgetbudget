import { BudgetState, Category } from './Types';

export const ACTION_INIT = Symbol('INIT');
export const ACTION_SET_NAME = Symbol('SET_NAME');
export const ACTION_SETTINGS_SET_NUMBER_LOCALE = Symbol(
  'ACTION_SETTINGS_SET_NUMBER_LOCALE',
);
export const ACTION_SETTINGS_SET_FRACTION_DIGITS = Symbol(
  'ACTION_SETTINGS_SET_FRACTION_DIGITS',
);
export const ACTION_SETTINGS_SET_SELECTED_ACCOUNTS = Symbol(
  'ACTION_SETTINGS_SET_SELECTED_ACCOUNTS',
);
export const ACTION_SETTINGS_SET_START_DATE = Symbol(
  'ACTION_SETTINGS_SET_START_DATE',
);
export const ACTION_SET_CATEGORY_VALUE = Symbol('ACTION_SET_CATEGORY_VALUE');
export const ACTION_SET_CATEGORY_ROLLOVER = Symbol(
  'ACTION_SET_CATEGORY_ROLLOVER',
);

type CurrencyMonthCategory = {
  currency: string;
  categoryId: number;
  monthKey: string;
};

type SetCategoryValueAction = {
  type: typeof ACTION_SET_CATEGORY_VALUE;
  payload: CurrencyMonthCategory & {
    amount: number;
  };
};
type SetCategoryRolloverAction = {
  type: typeof ACTION_SET_CATEGORY_ROLLOVER;
  payload: CurrencyMonthCategory & {
    rollover: boolean;
  };
};
type SetNameAction = {
  type: typeof ACTION_SET_NAME;
  payload: string;
};
type SetSettingsNumberLocale = {
  type: typeof ACTION_SETTINGS_SET_NUMBER_LOCALE;
  payload: string;
};
type SetSettingsFractionDigits = {
  type: typeof ACTION_SETTINGS_SET_FRACTION_DIGITS;
  payload: number;
};
type SetSettingsSelectedAccounts = {
  type: typeof ACTION_SETTINGS_SET_SELECTED_ACCOUNTS;
  payload: string[];
};
type SetSettingsStartDate = {
  type: typeof ACTION_SETTINGS_SET_START_DATE;
  payload: number;
};
type InitAction = {
  type: typeof ACTION_INIT;
  payload: BudgetState;
};
export type Action =
  | InitAction
  | SetCategoryValueAction
  | SetCategoryRolloverAction
  | SetNameAction
  | SetSettingsNumberLocale
  | SetSettingsFractionDigits
  | SetSettingsSelectedAccounts
  | SetSettingsStartDate;

function updateCategory(
  state: BudgetState,
  { currency, monthKey, categoryId }: CurrencyMonthCategory,
  update: (category: Category) => Category,
): BudgetState {
  const budgetInCurrency = state.budgets[currency] || {};
  const monthlyBudget = budgetInCurrency[monthKey] || { categories: {} };
  const category = monthlyBudget.categories[categoryId] || { amount: 0 };
  return {
    ...state,
    budgets: {
      ...state.budgets,
      [currency]: {
        ...budgetInCurrency,
        [monthKey]: {
          ...monthlyBudget,
          categories: {
            ...monthlyBudget.categories,
            [categoryId]: update(category),
          },
        },
      },
    },
  };
}

export default function budgetReducer(
  state: null | BudgetState,
  action: Action,
): null | BudgetState {
  if (action.type === ACTION_INIT) {
    return action.payload;
  }
  if (state === null) {
    throw new Error(
      `Unexpected action ${action.type.toString()} on uninitiated state`,
    );
  }

  switch (action.type) {
    case ACTION_SET_CATEGORY_ROLLOVER:
      return updateCategory(state, action.payload, (category) => ({
        ...category,
        rollover: action.payload.rollover,
      }));
    case ACTION_SET_CATEGORY_VALUE:
      return updateCategory(state, action.payload, (category) => ({
        ...category,
        amount: action.payload.amount,
      }));
    case ACTION_SET_NAME:
      return {
        ...state,
        name: action.payload,
      };
    case ACTION_SETTINGS_SET_NUMBER_LOCALE:
      return {
        ...state,
        settings: {
          ...state.settings,
          numberLocale: action.payload,
        },
      };
    case ACTION_SETTINGS_SET_FRACTION_DIGITS:
      return {
        ...state,
        settings: {
          ...state.settings,
          fractionDigits: action.payload,
        },
      };
    case ACTION_SETTINGS_SET_SELECTED_ACCOUNTS:
      return {
        ...state,
        settings: {
          ...state.settings,
          accounts: action.payload,
        },
      };
    case ACTION_SETTINGS_SET_START_DATE:
      return {
        ...state,
        settings: {
          ...state.settings,
          startDate: action.payload,
        },
      };
  }
}
