import { BrowserWindow, IpcMain, WebContents, App } from 'electron';
import { join } from 'path';
import { Settings } from '../src/shared/settings';

export type WindowManager = ReturnType<typeof createWindowManager>;
export default function createWindowManager(
  app: App,
  ipcMain: IpcMain,
  settings: Settings,
) {
  const windows: { [key: string]: BrowserWindow } = {};
  const newWindows: BrowserWindow[] = [];
  let appIsQuitting = false;
  app.once('before-quit', () => {
    appIsQuitting = true;
  });

  function getFile(win: BrowserWindow | undefined): string | undefined {
    return (Object.entries(windows).find(([_, w]) => w === win) || [])[0];
  }

  function findFile(sender: WebContents) {
    return (Object.entries(windows).find(
      ([_, { webContents }]) => webContents === sender,
    ) || [])[0];
  }

  function getWindow(sender: WebContents) {
    return (
      newWindows.find(({ webContents }) => webContents === sender) ||
      (Object.entries(windows).find(
        ([_, { webContents }]) => webContents === sender,
      ) || [])[1]
    );
  }

  function unregisterWindow(win: BrowserWindow | undefined) {
    if (!win) {
      throw new Error(`Unable to de-register window ${win}`);
    }
    const newWinI = newWindows.findIndex((w) => w === win);
    if (newWinI !== -1) {
      const [win] = newWindows.splice(newWinI, 1);
      return win;
    }

    const file = getFile(win);
    if (!file) {
      throw new Error(`Unable to de-register window ${win}`);
    }

    settings.removeOpenBudget(file);
    delete windows[file];
    return win;
  }

  function registerWindow(win: BrowserWindow, file?: string) {
    if (file) {
      windows[file] = win;
      settings.addOpenBudget(file);
      app.addRecentDocument(file);
      win.setRepresentedFilename(file);
    } else {
      newWindows.push(win);
    }
  }

  function createWindow(file?: string) {
    if (file && windows[file]) {
      windows[file].show();
      return;
    }

    const win = new BrowserWindow({
      width: 800,
      height: 600,
      minWidth: 500,
      minHeight: 300,
      titleBarStyle: 'hiddenInset',
      vibrancy: 'sidebar',
      webPreferences: {
        nodeIntegration: true,
      },
    });

    win.on('focus', () => {
      win.webContents.send('FOCUS');
    });
    win.on('blur', () => {
      win.webContents.send('BLUR');
    });

    const { SERVER_URL, NODE_ENV } = process.env;
    if (NODE_ENV === 'development') {
      if (!SERVER_URL) {
        throw new Error('Can not open dev window without SERVER_URL');
      }
      win.loadURL(SERVER_URL);
      win.webContents.openDevTools();
    } else {
      win.loadFile(join(__dirname, '../build/index.html'));
    }

    registerWindow(win, file);

    win.once('closed', (ev: any) => {
      if (!appIsQuitting) {
        unregisterWindow(win);
      }
    });
  }

  ipcMain.handle('INIT', (ev) => {
    return findFile(ev.sender);
  });
  ipcMain.on('QUIT', (ev) => {
    const win = getWindow(ev.sender);
    if (!win) {
      throw new Error('Can not quit unregistered window');
    }
    win.close();
  });
  ipcMain.on('FILE_EDITED', (ev, edited) => {
    const win = getWindow(ev.sender);
    if (!win) {
      throw new Error('Can not set edited for unregistered window');
    }
    win.setDocumentEdited(edited);
  });
  ipcMain.handle('MENU_FILE_NEW', () => {
    createWindow();
  });
  ipcMain.handle('MENU_FILE_OPEN_EXISTING', (_, file: string) => {
    createWindow(file);
  });

  return {
    init() {
      const previouslyOpen = settings.getOpenBudgets();
      if (previouslyOpen.length) {
        previouslyOpen.forEach(createWindow);
      } else {
        createWindow();
      }
    },
    createWindow,
    getFile,
    findFile,
    updateFile(sender: WebContents, file: string) {
      registerWindow(unregisterWindow(getWindow(sender)), file);
    },
    broadcast(data: any) {
      newWindows.concat(Object.values(windows)).forEach((win: any) => {
        win.send(data);
      });
    },
  };
}
