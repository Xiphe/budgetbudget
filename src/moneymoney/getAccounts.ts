import { Account, validateAccount, InteropAccount } from './Types';
import { ipcRenderer } from 'electron';
import { createResource, Resource } from '../lib';
import memoizeOne from 'memoize-one';

const filterAccounts = memoizeOne(
  (currency: string, interopAccounts: InteropAccount[]): Account[] => {
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

export type AccountsResource = Resource<Account[]>;
export async function getAccounts(): Promise<InteropAccount[]> {
  const probablyAccounts = await ipcRenderer.invoke('MM_EXPORT_ACCOUNTS');

  if (!Array.isArray(probablyAccounts)) {
    throw new Error('Unexpectedly got non-array as accounts');
  }

  return probablyAccounts.map(validateAccount);
}

const getAccountsMemo = memoizeOne((cacheToken: symbol) => getAccounts());

function getAccountsResource(
  currency: string,
  cacheToken: symbol,
): AccountsResource {
  return createResource(() =>
    getAccountsMemo(cacheToken).then(filterAccounts.bind(null, currency)),
  );
}

export default memoizeOne(getAccountsResource);
