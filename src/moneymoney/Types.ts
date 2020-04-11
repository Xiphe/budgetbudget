import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { ThrowReporter } from 'io-ts/lib/ThrowReporter';

const date = new t.Type<Date, Date, unknown>(
  'date',
  (input: unknown): input is Date => input instanceof Date,
  (input, context) =>
    input instanceof Date ? t.success(input) : t.failure(input, context),
  t.identity,
);

const transactionShape = t.intersection(
  [
    t.type(
      {
        id: t.number,
        amount: t.number,
        currency: t.string,
        accountNumber: t.string,
        booked: t.boolean,
        bookingDate: date,
        valueDate: date,
        name: t.string,
      },
      'required',
    ),
    t.partial(
      {
        purpose: t.string,
        category: t.string,
        categoryId: t.number,
      },
      'optional',
    ),
  ],
  'transaction',
);
const interopAccountShape = t.type(
  {
    accountNumber: t.string,
    name: t.string,
    balance: t.array(t.tuple([t.number, t.string])),
  },
  'account',
);

export type Transaction = t.TypeOf<typeof transactionShape>;
type InteropAccount = t.TypeOf<typeof interopAccountShape>;
export type Account = {
  name: string;
  balance: number;
  number: string;
};

export function validateTransaction(data: unknown): Transaction {
  const c = transactionShape.decode(data);
  if (isLeft(c)) {
    console.log(data);
    throw ThrowReporter.report(c);
  }
  return data as Transaction;
}
export function validateAccount(data: unknown): InteropAccount {
  const c = interopAccountShape.decode(data);
  if (isLeft(c)) {
    throw ThrowReporter.report(c);
  }
  return data as InteropAccount;
}

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

export type AmountWithTransactions = {
  amount: number;
  transactions: Transaction[];
};
export type Balance = {
  total: number;
  categories: {
    [id: number]: AmountWithTransactions;
  };
  uncategorised: AmountWithTransactions;
};
export type Balances = {
  [month: string]: undefined | Balance;
};
