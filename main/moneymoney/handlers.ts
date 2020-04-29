import { IpcMain } from 'electron';
import { join } from 'path';
import { exec } from 'child_process';
import { parse } from 'plist';
import osascript from './osascript';
import scriptsDir from '../scriptsDir';

function isDbLocked(err: any) {
  return err.stderr && err.stderr.includes('Locked database. (-2720)');
}

function delay(t: number) {
  return new Promise((r) => setTimeout(r, t));
}

async function moneymoneyExists() {
  if (
    (
      await osascript(join(scriptsDir, 'moneymoneyExists.applescript'))
    ).trim() !== 'true'
  ) {
    throw new Error('Seems as if MoneyMoney is not installed on your mac');
  }
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
      await moneymoneyExists();
      throw err;
    }
  }) as any;
}

export default function moneymoneyHandlers(ipcMain: IpcMain) {
  ipcMain.handle(
    'MM_EXPORT_ACCOUNTS',
    withRetry(async () => {
      return parse(
        await osascript(join(scriptsDir, 'exportAccounts.applescript')),
      );
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

  ipcMain.handle(
    'MM_EXPORT_CATEGORIES',
    withRetry(async () => {
      return parse(
        await osascript(join(scriptsDir, 'exportCategories.applescript')),
      );
    }),
  );

  ipcMain.on('MM_OPEN', () => {
    exec('open -a MoneyMoney');
  });
}
