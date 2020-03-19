const { app, BrowserWindow } = require('electron');

console.log(process.env.NODE_ENV, process.env.SERVER_URL);
function createWindow() {
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
}

app.on('ready', createWindow);
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
