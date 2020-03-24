export const CURRENCIES = ['EUR', 'USD'] as const;

export type Currency = typeof CURRENCIES[number];
export type Amount = [number, Currency];

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
export function isCategory(tree: CategoryTree): tree is Category {
  return typeof (tree as Category).id === 'number';
}

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

export type AmountWithTransactions = {
  amount: number;
  transactions: Transaction[];
};
export type Balance = {
  total: number;
  categories: {
    [key: number]: AmountWithTransactions;
  };
  uncategorised: AmountWithTransactions;
};
export type Balances = {
  [key: string]: undefined | Balance;
};
