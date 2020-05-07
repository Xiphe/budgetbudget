import { Transaction, TransactionsByAccount } from '../../src/moneymoney/Types';
import faker from 'faker';

export function createTransactions(
  transactions: Transaction[] = [],
): TransactionsByAccount {
  return [{ transactions }];
}
let i = 0;
export default function createTransaction(
  transaction: Partial<Transaction> = {},
): Transaction {
  return {
    id: i++,
    amount: faker.random.number(5000),
    currency: 'EUR',
    categoryUuid: faker.random.uuid(),
    accountUuid: faker.random.uuid(),
    booked: true,
    bookingDate: new Date(faker.date.between('2019-07-07', '2019-07-31')),
    ...transaction,
  };
}
