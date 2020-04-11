import { Account, validateAccount } from './Types';
import { ipcRenderer } from '../lib';
import { parse } from 'plist';

export default async function getAccounts(
  currency: string,
): Promise<Account[]> {
  const parsedStdout = parse(await ipcRenderer.invoke('MM_EXPORT_ACCOUNTS'));

  if (!Array.isArray(parsedStdout)) {
    throw new Error('Unexpectedly got non-array as accounts');
  }

  return parsedStdout
    .map((data: unknown): Account | false => {
      const { accountNumber, balance, name } = validateAccount(data);
      if (!accountNumber.length) {
        return false;
      }
      const currencyBalance = balance.find(([_, c]) => c === currency);
      if (!currencyBalance) {
        return false;
      }
      return {
        name,
        number: accountNumber,
        balance: currencyBalance[0],
      };
    })
    .filter((data: Account | false): data is Account => Boolean(data));
}
