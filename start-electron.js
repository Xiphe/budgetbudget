const { app, dialog, BrowserWindow, Menu, ipcMain } = require('electron');

const windows = {};

function createWindow(file) {
  if (windows[file]) {
    windows[file].show();
    return;
  }

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL(process.env.SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile('./build/index.html');
  }

  if (file) {
    windows[file] = win;
  }
}

ipcMain.handle('INIT', (ev) => {
  const [file] =
    Object.entries(windows).find(
      ([_, { webContents }]) => webContents === ev.sender,
    ) || [];

  return file;
});

const menu = Menu.buildFromTemplate([
  { role: 'appMenu' },
  {
    label: 'File',
    submenu: [
      {
        label: 'New Budget',
        click() {
          createWindow();
        },
      },
      {
        label: 'Open',
        async click() {
          const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Budget', extensions: ['budget'] }],
          });
          if (canceled) {
            return;
          }
          filePaths.forEach(createWindow);
        },
      },
    ],
  },
]);
Menu.setApplicationMenu(menu);

app.on('ready', () => createWindow());
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
