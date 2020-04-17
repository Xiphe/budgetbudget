import { IpcMain } from 'electron';
import { join } from 'path';
import { exec } from 'child_process';
import { parse } from 'plist';
import osascript from './osascript';

const scriptsDir = __dirname.includes('/app.asar/')
  ? join(process.resourcesPath, 'scripts')
  : join((require as any).main.filename, '../../main/moneymoney');

function isDbLocked(err: any) {
  return err.stderr && err.stderr.includes('Locked database. (-2720)');
}

function delay(t: number) {
  return new Promise((r) => setTimeout(r, t));
}

function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  retry: number = 0,
): T {
  return (async (...args: any[]): Promise<any> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (isDbLocked(err)) {
        if (retry < 3) {
          await delay(retry * 500);
          return withRetry(fn, retry + 1)(...args);
        }
        throw new Error('MoneyMoney database is locked');
      }
      throw err;
    }
  }) as any;
}

export default function moneymoneyHandlers(ipcMain: IpcMain) {
  const unusableAccounts: string[] = [];
  const usableAccounts: string[] = [];
  const canHandleTransactions = async (accountNumber: string) => {
    if (unusableAccounts.includes(accountNumber)) {
      return false;
    }
    if (usableAccounts.includes(accountNumber)) {
      return true;
    }

    try {
      await osascript(
        join(scriptsDir, 'exportTransactions.applescript'),
        accountNumber,
        new Date().toLocaleDateString(),
      );
      usableAccounts.push(accountNumber);
      return true;
    } catch (err) {
      unusableAccounts.push(accountNumber);
      return false;
    }
  };

  ipcMain.handle(
    'MM_EXPORT_ACCOUNTS',
    withRetry(async () => {
      const accounts = parse(
        await osascript(join(scriptsDir, 'exportAccounts.applescript')),
      );
      if (!Array.isArray(accounts)) {
        throw new Error('Unexpectedly got non-array as accounts');
      }
      const usableAccountsOrFalse = await Promise.all(
        accounts.map(
          async (data: unknown): Promise<object | false> => {
            if (typeof data !== 'object' || data === null) {
              return false;
            }
            const accountNumber: unknown = (data as any).accountNumber;
            if (typeof accountNumber !== 'string' || !accountNumber.length) {
              return false;
            }
            if (!(await canHandleTransactions(accountNumber))) {
              return false;
            }

            return data;
          },
        ),
      );

      return usableAccountsOrFalse.filter(Boolean);
    }),
  );

  ipcMain.handle(
    'MM_EXPORT_TRANSACTIONS',
    withRetry(async (_, ...args) => {
      return parse(
        await osascript(
          join(scriptsDir, 'exportTransactions.applescript'),
          ...args,
        ),
      );
    }),
  );

  ipcMain.on('MM_OPEN', () => {
    exec('open -a MoneyMoney');
  });
}
