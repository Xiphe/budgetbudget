import { ipcMain } from 'electron';
import { MONEY_MONEY_API_IPC_CHANNEL as CHANNEL } from '../shared/constants';
import { server } from '../shared/ipc';
import { AllMessages, Account } from '../shared/MoneyMoneyApiTypes';
import { osascript } from './lib';
import { parse } from 'plist';

function isAccount(account: any): account is Account {
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

function normalizeAccounts(accounts: Account[]) {
  return Promise.all(
    accounts.map(async ({ name, balance }) => {
      return {
        name,
        balance,
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
