const GET_ACCOUNTS = 'getAccounts';
const GET_CATEGORIES = 'getCategories';
const GET_TRANSACTIONS = 'getTransactions';
export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const ACTIONS = [
  GET_ACCOUNTS,
  GET_CATEGORIES,
  GET_TRANSACTIONS,
] as const;

export const CURRENCIES = ['EUR'] as const;

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
  parents: string[];
};

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

export type GetAccounts = {
  action: typeof GET_ACCOUNTS;
  payload: void;
  response: Account[];
};

export type GetCategories = {
  action: typeof GET_CATEGORIES;
  payload: void;
  response: Category[];
};

export type GetTransactions = {
  action: typeof GET_TRANSACTIONS;
  payload: void;
  response: Transaction[];
};

export type AllMessages = [GetAccounts, GetCategories, GetTransactions];
