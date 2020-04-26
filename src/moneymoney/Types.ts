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
const unit8Array = new t.Type<Uint8Array, Uint8Array, unknown>(
  'date',
  (input: unknown): input is Uint8Array => input instanceof Uint8Array,
  (input, context) =>
    input instanceof Uint8Array ? t.success(input) : t.failure(input, context),
  t.identity,
);

const transactionShape = t.intersection(
  [
    t.type(
      {
        account: t.string,
        id: t.number,
        amount: t.number,
        currency: t.string,
        category: t.string,
        accountNumber: t.string,
        booked: t.boolean,
        bookingDate: date,
      },
      'required',
    ),
    t.partial(
      {
        purpose: t.string,
        name: t.string,
        valueDate: date,
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
    currency: t.string,
    group: t.boolean,
    icon: unit8Array,
    portfolio: t.boolean,
    uuid: t.string,
  },
  'account',
);
const categoryShape = t.type({
  budget: t.union([
    t.type({}),
    t.type({
      amount: t.number,
      available: t.number,
      period: t.union([
        t.literal('monthly'),
        t.literal('quarterly'),
        t.literal('yearly'),
        t.literal('total'),
      ]),
    }),
  ]),
  name: t.string,
  currency: t.string,
  default: t.boolean,
  group: t.boolean,
  icon: unit8Array,
  indentation: t.number,
  uuid: t.string,
});

export type Category = t.TypeOf<typeof categoryShape>;
export type Transaction = t.TypeOf<typeof transactionShape>;
type InteropAccount = t.TypeOf<typeof interopAccountShape>;
export type Account = {
  name: string;
  balance: number;
  icon: Uint8Array;
  uuid: string;
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
export function validateCategory(data: unknown): Category {
  const c = categoryShape.decode(data);
  if (isLeft(c)) {
    throw ThrowReporter.report(c);
  }
  return data as Category;
}

// export type Category = {
//   id: number;
//   name: string;
// };
// export type CategoryGroup = {
//   name: string;
//   children: CategoryTree[];
// };
// export type CategoryTree = Category | CategoryGroup;
// export function isCategory(tree: CategoryTree): tree is Category {
//   return typeof (tree as Category).id === 'number';
// }

export type AmountWithTransactions = {
  amount: number;
  transactions: Transaction[];
};
export type Balance = {
  total: number;
  categories: {
    [id: string]: AmountWithTransactions;
  };
  uncategorised: AmountWithTransactions;
};
export type Balances = {
  [month: string]: undefined | Balance;
};
