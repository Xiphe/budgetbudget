import { IpcMain } from 'electron';
import { exec } from 'child_process';
import osascript from './osascript';

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
  ipcMain.handle(
    'MM_EXPORT_ACCOUNTS',
    withRetry(() => {
      return osascript(__dirname + '/exportAccounts.applescript');
    }),
  );

  ipcMain.handle(
    'MM_EXPORT_TRANSACTIONS',
    withRetry((_, ...args) => {
      return osascript(__dirname + '/exportTransactions.applescript', ...args);
    }),
  );

  ipcMain.on('MM_OPEN', () => {
    exec('open -a MoneyMoney');
  });
}
