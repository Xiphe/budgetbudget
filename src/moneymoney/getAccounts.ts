import { Account, validateAccount } from './Types';
import { ipcRenderer } from '../lib';
import { parse } from 'plist';
import getTransactions from './getTransactions';

async function accountHandlesTransactions(
  accountNumber: string,
  currency: string,
): Promise<boolean> {
  try {
    await getTransactions([accountNumber], currency, new Date().getTime());
    return true;
  } catch (err) {
    return false;
  }
}

export default async function getAccounts(
  currency: string,
): Promise<Account[]> {
  const parsedStdout = parse(await ipcRenderer.invoke('MM_EXPORT_ACCOUNTS'));

  if (!Array.isArray(parsedStdout)) {
    throw new Error('Unexpectedly got non-array as accounts');
  }

  const accounts = await Promise.all(
    parsedStdout.map(
      async (data: unknown): Promise<Account | false> => {
        const { accountNumber, balance, name } = validateAccount(data);
        if (!accountNumber.length) {
          return false;
        }
        const currencyBalance = balance.find(([_, c]) => c === currency);
        if (
          !currencyBalance ||
          !(await accountHandlesTransactions(accountNumber, currency))
        ) {
          return false;
        }

        return {
          name,
          number: accountNumber,
          balance: currencyBalance[0],
        };
      },
    ),
  );

  return accounts.filter((data: Account | false): data is Account =>
    Boolean(data),
  );
}
