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

function removeEmptyAccountGroups(data: unknown) {
  if (!Array.isArray(data)) {
    throw new Error('Unexpectedly got non-array as accounts data');
  }

  return data.filter((rawAccount: unknown) => {
    if (typeof rawAccount !== 'object' || rawAccount === null) {
      throw new Error(`Unexpectedly got ${typeof rawAccount} in accounts data`);
    }

    const { group, icon, name, uuid } = rawAccount as any;

    if (group === undefined && icon === undefined) {
      console.warn(
        'Ignoring account/account-group',
        name || uuid,
        'it is probably empty',
      );
      return false;
    }

    return true;
  });
}

function identify(thing: any) {
  switch (true) {
    case thing.budget !== undefined:
      return `Category "${thing.name}"`;
    case thing.accountNumber !== undefined:
      return `Account "${thing.name}"`;
    default:
      return thing.name || JSON.stringify(thing);
  }
}

function base64Icons(data: unknown) {
  if (!Array.isArray(data)) {
    throw new Error('Unexpectedly got non-array as data');
  }

  return data.map((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new Error('Unexpectedly got non-object in data array');
    }

    const icon: unknown = (entry as any).icon;

    if (!(icon instanceof Buffer)) {
      throw new Error(
        `Unexpectedly got ${typeof icon} as icon in ${identify(entry)}`,
      );
    }

    return {
      ...entry,
      icon: `data:image/png;base64,${icon.toString('base64')}`,
    };
  });
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

function extractTransactions(val: unknown): unknown[] {
  if (
    typeof val === 'object' &&
    val !== null &&
    Array.isArray((val as any).transactions)
  ) {
    return (val as any).transactions;
  }

  throw new Error('Unexpected transactions object');
}

async function exportTransactions(
  _: any,
  accountNumbers: string[],
  startDate: string,
): Promise<unknown[]>;
async function exportTransactions(_: any): Promise<unknown[]>;
async function exportTransactions(
  _: any,
  accountNumbers?: string[],
  startDate?: string,
): Promise<unknown[]> {
  if (accountNumbers && startDate) {
    const transactions = await Promise.all(
      accountNumbers.map(async (accountNumber) => {
        return parse(
          await osascript(
            join(scriptsDir, 'exportTransactions.applescript'),
            accountNumber,
            startDate,
          ),
        );
      }),
    );

    return transactions
      .map(extractTransactions)
      .reduce((m, ts) => m.concat(ts), []);
  }

  return extractTransactions(
    parse(
      await osascript(join(scriptsDir, 'exportAllTransactions.applescript')),
    ),
  );
}

export default function moneymoneyHandlers(ipcMain: IpcMain) {
  ipcMain.handle(
    'MM_EXPORT_ACCOUNTS',
    withRetry(async () => {
      return base64Icons(
        removeEmptyAccountGroups(
          parse(
            await osascript(join(scriptsDir, 'exportAccounts.applescript')),
          ),
        ),
      );
    }),
  );

  ipcMain.handle('MM_EXPORT_TRANSACTIONS', withRetry(exportTransactions));

  ipcMain.handle(
    'MM_EXPORT_CATEGORIES',
    withRetry(async () => {
      return base64Icons(
        parse(
          await osascript(join(scriptsDir, 'exportCategories.applescript')),
        ),
      );
    }),
  );

  ipcMain.on('MM_OPEN', () => {
    exec('open -a MoneyMoney');
  });
}
