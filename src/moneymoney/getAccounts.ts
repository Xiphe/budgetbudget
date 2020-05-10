import { Account, validateAccount, InteropAccount } from './Types';
import { ipcRenderer } from 'electron';
import { createResource } from '../lib';

export type AccountsResource = {
  read: (currency: string) => Account[];
};
export async function getAccounts(): Promise<InteropAccount[]> {
  const probablyAccounts = await ipcRenderer.invoke('MM_EXPORT_ACCOUNTS');

  if (!Array.isArray(probablyAccounts)) {
    throw new Error('Unexpectedly got non-array as accounts');
  }

  return probablyAccounts.map(validateAccount);
}

const getAccountsResource: {
  (): AccountsResource;
  cache?: AccountsResource;
} = () => {
  if (!getAccountsResource.cache) {
    const res = createResource(() => getAccounts());

    getAccountsResource.cache = {
      read(currency: string) {
        const interopAccounts = res.read();

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
    };
  }

  return getAccountsResource.cache!;
};

export default getAccountsResource;
