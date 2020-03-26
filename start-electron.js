const {
  app,
  dialog,
  BrowserWindow,
  Menu,
  ipcMain,
  nativeTheme,
} = require('electron');

const windows = {};
const newWindows = [];

function getFile(sender) {
  return (Object.entries(windows).find(
    ([_, { webContents }]) => webContents === sender,
  ) || [])[0];
}

function broadcast(data) {
  newWindows.concat(Object.values(windows)).forEach((win) => {
    win.send(data);
  });
}

function unregisterWindow(sender) {
  const file = getFile(sender);
  if (file) {
    const win = windows[file];
    delete windows[file];
    return win;
  } else {
    const i = newWindows.findIndex(({ webContents }) => webContents === sender);
    if (i !== -1) {
      const [win] = newWindows.splice(i, 1);
      return win;
    } else {
      throw new Error(`Unable to de-register window ${sender}`);
    }
  }
}

function createWindow(file) {
  if (windows[file]) {
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

  if (process.env.NODE_ENV === 'development') {
    win.loadURL(process.env.SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile('./build/index.html');
  }

  if (file) {
    windows[file] = win;
    win.setRepresentedFilename(file);
  } else {
    newWindows.push(win);
  }

  win.once('close', (ev) => {
    unregisterWindow(ev.sender.webContents);
  });
}

ipcMain.handle('INIT', (ev) => {
  return getFile(ev.sender);
});

async function openFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Budget', extensions: ['budget'] }],
  });
  if (canceled) {
    return;
  }
  filePaths.forEach(createWindow);
}
ipcMain.on('FILE_EDITED', (ev, edited) => {
  (
    windows[getFile(ev.sender)] ||
    newWindows.find(({ webContents }) => webContents === ev.sender)
  ).setDocumentEdited(edited);
});
ipcMain.handle('MENU_FILE_OPEN', openFile);
ipcMain.handle('MENU_FILE_NEW', () => {
  createWindow();
});

nativeTheme.on('updated', () => {
  broadcast('UPDATE_SCHEME');
});

async function save(newFile, sender) {
  const win = unregisterWindow(sender);
  windows[newFile] = win;
  win.setRepresentedFilename(newFile);
  sender.send('SAVE', newFile);
}
async function saveAs(ev, name) {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: 'my.budget',
    filters: [{ name: 'Budget', extensions: ['budget'] }],
  });
  if (!canceled) {
    save(filePath, ev.sender);
  }
}
ipcMain.on('SAVE_AS', saveAs);
ipcMain.on('SAVE', async (ev, name) => {
  const existing = getFile(ev.sender);
  if (existing) {
    save(existing, ev.sender);
  } else {
    saveAs(ev);
  }
});

const defaultMenu = Menu.buildFromTemplate([
  { role: 'appMenu' },
  {
    label: 'File',
    submenu: [
      {
        label: 'New Budget',
        accelerator: 'CommandOrControl+N',
        click() {
          createWindow();
        },
      },
      { type: 'separator' },
      {
        label: 'Open...',
        accelerator: 'CommandOrControl+O',
        click: openFile,
      },
      { type: 'separator' },
      process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
    ],
  },
]);

app.on('ready', () => createWindow());
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  } else {
    Menu.setApplicationMenu(defaultMenu);
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
