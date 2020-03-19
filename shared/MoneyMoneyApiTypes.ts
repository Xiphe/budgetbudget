const GET_ACCOUNTS = 'getAccounts';
const GET_CATEGORIES = 'getCategories';
const GET_BALANCES = 'getBalances';
export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const ACTIONS = [GET_ACCOUNTS, GET_CATEGORIES, GET_BALANCES] as const;

export const CURRENCIES = ['EUR', 'USD'] as const;

export type Currency = typeof CURRENCIES[number];

export type Balance = [number, Currency];

export type Month = typeof MONTHS[number];

export type Account = {
  name: string;
  number: string;
  balance: Balance;
};

export type Category = {
  id: number;
  name: string;
};

export type CategoryGroup = {
  name: string;
  children: CategoryTree[];
};

export type CategoryTree = Category | CategoryGroup;

export type Transaction = {
  id: number;
  amount: number;
  accountNumber: string;
  booked: boolean;
  bookingDate: Date;
  valueDate: Date;
  currency: Currency;
  name: string;
  purpose?: string;
  category?: string;
  categoryId?: number;
};

export type CategoryBalance = {
  amount: number;
  currency: Currency;
  transactions: Transaction[];
};
export type MonthlyBalance = {
  month: Month;
  year: number;
  categories: {
    [key: number]: CategoryBalance[];
  };
  uncategorised: CategoryBalance[];
};

export type GetAccounts = {
  action: typeof GET_ACCOUNTS;
  payload: void;
  response: Account[];
};

export type GetCategories = {
  action: typeof GET_CATEGORIES;
  payload: void;
  response: CategoryTree[];
};

export type GetBalances = {
  action: typeof GET_BALANCES;
  payload: void;
  response: MonthlyBalance[];
};

export type AllMessages = [GetAccounts, GetCategories, GetBalances];
