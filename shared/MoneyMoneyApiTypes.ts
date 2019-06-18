const GET_ACCOUNTS = 'getAccounts';
const SOME_THINGS = 'someThings';
export const ACTIONS = [GET_ACCOUNTS] as const;

type Currency = 'EUR';
type Balance = [number, Currency];

export type Account = {
  name: string;
  balance: Balance;
};

export type GetAccounts = {
  action: typeof GET_ACCOUNTS;
  payload: void;
  response: Account[];
};

export type AllMessages = [GetAccounts];
