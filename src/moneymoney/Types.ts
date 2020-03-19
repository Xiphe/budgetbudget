export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const CURRENCIES = ['EUR', 'USD'] as const;

export type Currency = typeof CURRENCIES[number];
export type Amount = [number, Currency];
export type Month = typeof MONTHS[number];

export type Account = {
  name: string;
  number: string;
  balance: Amount;
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
  amount: Amount;
  accountNumber: string;
  booked: boolean;
  bookingDate: Date;
  valueDate: Date;
  name: string;
  purpose?: string;
  category?: string;
  categoryId?: number;
};

export type Balance = {
  amount: Amount;
  transactions: Transaction[];
};
export type MonthlyBalance = {
  month: Month;
  year: number;
  total: Amount[];
  categories: {
    [key: number]: Balance[];
  };
  uncategorised: Balance[];
};
