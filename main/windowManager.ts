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

  function getFile(sender: WebContents): string | undefined {
    return (Object.entries(windows).find(
      ([_, { webContents }]) => webContents === sender,
    ) || [])[0];
  }

  function unregisterWindow(sender: WebContents) {
    const file = getFile(sender);
    if (file) {
      settings.removeOpenBudget(file);
      const win = windows[file];
      delete windows[file];
      return win;
    } else {
      const i = newWindows.findIndex(
        ({ webContents }) => webContents === sender,
      );
      if (i !== -1) {
        const [win] = newWindows.splice(i, 1);
        return win;
      } else {
        throw new Error(`Unable to de-register window ${sender}`);
      }
    }
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

    win.once('close', (ev: any) => {
      if (!appIsQuitting) {
        unregisterWindow(ev.sender.webContents);
      }
    });
  }

  ipcMain.handle('INIT', (ev) => {
    return getFile(ev.sender);
  });
  ipcMain.on('FILE_EDITED', (ev, edited) => {
    const file = getFile(ev.sender);
    const win =
      (file && windows[file]) ||
      newWindows.find(({ webContents }) => webContents === ev.sender);
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
    updateFile(sender: WebContents, file: string) {
      registerWindow(unregisterWindow(sender), file);
    },
    broadcast(data: any) {
      newWindows.concat(Object.values(windows)).forEach((win: any) => {
        win.send(data);
      });
    },
  };
}
