import { ipcMain } from 'electron';
import { MONEY_MONEY_API_IPC_CHANNEL as CHANNEL } from '../shared/constants';
import { server } from '../shared/ipc';
import { AllMessages, Account } from '../shared/MoneyMoneyApiTypes';
import { osascript } from './lib';
import { parse } from 'plist';
import { Omit } from '../shared/types';

type AccountWithMultiBalance = Omit<Account, 'balance'> & {
  balance: Account['balance'][];
};

function isAccount(account: any): account is AccountWithMultiBalance {
  if (!account.accountNumber || !account.accountNumber.length) {
    /* Though the account number is not part of the type, we're excluding
       accounts without number, assuming its a group */
    return false;
  }

  return (
    account.name &&
    account.name.length &&
    account.icon &&
    account.icon.length &&
    account.balance &&
    account.balance.length
  );
}

function normalizeAccounts(
  accounts: AccountWithMultiBalance[],
): Promise<Account[]> {
  return Promise.all(
    accounts.map(async ({ name, balance }) => {
      if (balance.length !== 1) {
        throw new Error(
          `Unexpectedly got multiple balance from account "${name}"`,
        );
      }
      return {
        name,
        balance: balance[0],
      };
    }),
  );
}

async function getAccounts(): Promise<Account[]> {
  try {
    const parsedStdout = parse(
      await osascript('tell application "MoneyMoney" to export accounts'),
    );

    if (!Array.isArray(parsedStdout)) {
      throw new Error('Unexpectedly got non-array as accounts');
    }

    return normalizeAccounts(parsedStdout.filter(isAccount));
  } catch (err) {
    console.log(err);
    if (err.stderr && err.stderr.includes('Locked database. (-2720)')) {
      throw { retry: true, message: 'MoneyMoney database is locked' };
    }

    throw err.stderr || err;
  }
}

export default () => {
  server<AllMessages>(CHANNEL, ipcMain, {
    getAccounts,
  });
};
