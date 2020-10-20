import * as t from 'io-ts';
import { isLeft } from 'fp-ts/lib/Either';
import { ThrowReporter } from 'io-ts/lib/ThrowReporter';

function isSomeDate(input: unknown): input is Date {
  if (input instanceof Date) {
    return true;
  }
  /* In tests, the date might come from a different window */
  if (process.env.REACT_APP_ENV === 'test') {
    if (typeof input !== 'object') {
      return false;
    }
    const getTime = (input as any).getTime;
    if (typeof getTime !== 'function') {
      return false;
    }
    const time: unknown = getTime.call(input);
    if (typeof time !== 'number') {
      return false;
    }
    return time === new Date(time).getTime();
  }
  return false;
}
const date = new t.Type<Date, Date, unknown>(
  'date',
  isSomeDate,
  (input, context) =>
    isSomeDate(input) ? t.success(input) : t.failure(input, context),
  t.identity,
);
const transactionShape = t.intersection(
  [
    t.type(
      {
        id: t.number,
        amount: t.number,
        currency: t.string,
        categoryUuid: t.string,
        accountUuid: t.string,
        booked: t.boolean,
        bookingDate: date,
      },
      'required',
    ),
    t.partial(
      {
        categoryId: t.number,
        category: t.string,
        purpose: t.string,
        name: t.string,
        valueDate: date,
      },
      'optional',
    ),
  ],
  'transaction',
);
const transactionsShape = t.array(transactionShape, 'transactions');

const interopAccountShape = t.type(
  {
    accountNumber: t.string,
    name: t.string,
    balance: t.array(t.tuple([t.number, t.string])),
    currency: t.string,
    group: t.boolean,
    indentation: t.number,
    icon: t.string,
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
  icon: t.string,
  indentation: t.number,
  uuid: t.string,
});

export type Category = t.TypeOf<typeof categoryShape>;
export type Transaction = t.TypeOf<typeof transactionShape>;
export type Transactions = t.TypeOf<typeof transactionsShape>;
export type InteropAccount = t.TypeOf<typeof interopAccountShape>;
export type Account = {
  name: string;
  balance: number;
  group: boolean;
  indentation: number;
  portfolio: boolean;
  icon: string;
  uuid: string;
  number: string;
};

export function validateTransactions(data: unknown): Transactions {
  const c = transactionsShape.decode(data);
  if (isLeft(c)) {
    throw ThrowReporter.report(c);
  }
  return c.right;
}
export function validateAccount(data: unknown): InteropAccount {
  const c = interopAccountShape.decode(data);
  if (isLeft(c)) {
    throw ThrowReporter.report(c);
  }
  return c.right;
}
export function validateCategory(data: unknown): Category {
  const c = categoryShape.decode(data);
  if (isLeft(c)) {
    throw ThrowReporter.report(c);
  }
  return c.right;
}

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
