import { Account, validateAccount, InteropAccount } from './Types';
import { ipcRenderer } from 'electron';
import { createResource } from '../lib';
import memoizeOne from 'memoize-one';

const filterAccounts = memoizeOne(
  (interopAccounts: InteropAccount[], currency: string): Account[] => {
    return interopAccounts
      .map(
        ({
          accountNumber,
          balance,
          currency: accountCurrency,
          name,
          indentation,
          uuid,
          icon,
          group,
          portfolio,
        }) => {
          const currencyBalance = balance.find(([_, c]) => c === currency);
          if (accountCurrency !== currency || !currencyBalance) {
            return false;
          }

          return {
            uuid,
            icon,
            group,
            indentation,
            portfolio,
            name,
            number: accountNumber,
            balance: currencyBalance[0],
          };
        },
      )
      .filter((data: Account | false): data is Account => Boolean(data));
  },
);

export type AccountsResource = {
  reCreate: () => AccountsResource;
  read: (currency: string) => Account[];
};
export async function getAccounts(): Promise<InteropAccount[]> {
  const probablyAccounts = await ipcRenderer.invoke('MM_EXPORT_ACCOUNTS');

  if (!Array.isArray(probablyAccounts)) {
    throw new Error('Unexpectedly got non-array as accounts');
  }

  return probablyAccounts.map(validateAccount);
}

export default function getAccountsResource() {
  const res = createResource(() => getAccounts());

  return {
    reCreate() {
      return getAccountsResource();
    },
    read(currency: string) {
      return filterAccounts(res.read(), currency);
    },
  };
}
