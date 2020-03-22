import { Account, CURRENCIES } from './Types';
import { osascript, delay } from '../lib';
import { parse } from 'plist';
import isDbLocked from './isDbLocked';

type InteropAccount = Omit<Account, 'balance'> & {
  balance: Account['balance'][];
  attributes?: { [key: string]: string };
  accountNumber: string;
};

function normalizeAccounts(accounts: InteropAccount[]): Promise<Account[]> {
  return Promise.all(
    accounts.map(async ({ name, balance, accountNumber: number }) => {
      if (balance.length !== 1) {
        throw new Error(
          `Unexpectedly got multiple balance from account "${name}"`,
        );
      }
      return {
        name,
        balance: balance[0],
        number,
      };
    }),
  );
}

function isVisible(account: InteropAccount) {
  return !account.attributes || account.attributes['mb-hide'] !== 'true';
}

function isAccount(account: any): account is InteropAccount {
  if (
    typeof account.accountNumber !== 'string' ||
    !account.accountNumber.length
  ) {
    /* Silently filter out accounts without number, assuming its a group */
    return false;
  }

  if (
    typeof account.name === 'string' &&
    Array.isArray(account.balance) &&
    (account.balance as any[]).every(
      (balance) =>
        Array.isArray(balance) &&
        balance.length === 2 &&
        typeof balance[0] === 'number' &&
        CURRENCIES.includes(balance[1]),
    )
  ) {
    return true;
  }

  throw new Error(`Account schema mismatch on ${JSON.stringify(account)}`);
}

export default async function getAccounts(retry = 0): Promise<Account[]> {
  console.log('GET ACCOUNTS', retry);
  try {
    const parsedStdout = parse(
      await osascript('tell application "MoneyMoney" to export accounts'),
    );

    if (!Array.isArray(parsedStdout)) {
      throw new Error('Unexpectedly got non-array as accounts');
    }

    return normalizeAccounts(parsedStdout.filter(isAccount).filter(isVisible));
  } catch (err) {
    if (isDbLocked(err)) {
      if (retry < 3) {
        await delay(retry * 500);
        return getAccounts(retry + 1);
      }
      throw new Error('MoneyMoney database is locked');
    }
    throw err;
  }
}
