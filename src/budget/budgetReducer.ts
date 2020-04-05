import { BudgetState, Category } from './Types';

export const ACTION_INIT = Symbol('INIT');
export const ACTION_SET_CATEGORY_VALUE = Symbol('ACTION_SET_CATEGORY_VALUE');

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

type InitAction = {
  type: typeof ACTION_INIT;
  payload: BudgetState;
};
export type Action = InitAction | SetCategoryValueAction;

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
    case ACTION_SET_CATEGORY_VALUE:
      return updateCategory(state, action.payload, (category) => ({
        ...category,
        amount: action.payload.amount,
      }));
  }
}
