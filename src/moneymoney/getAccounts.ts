import { Account, validateAccount } from './Types';
import { ipcRenderer } from 'electron';

export default async function getAccounts(
  currency: string,
): Promise<Account[]> {
  const probablyAccounts = await ipcRenderer.invoke('MM_EXPORT_ACCOUNTS');

  if (!Array.isArray(probablyAccounts)) {
    throw new Error('Unexpectedly got non-array as accounts');
  }

  const accounts = await Promise.all(
    probablyAccounts.map(
      async (data: unknown): Promise<Account | false> => {
        const {
          accountNumber,
          balance,
          currency: accountCurrency,
          name,
          indentation,
          uuid,
          icon,
          group,
          portfolio,
        } = validateAccount(data);

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
    ),
  );

  return accounts.filter((data: Account | false): data is Account =>
    Boolean(data),
  );
}
