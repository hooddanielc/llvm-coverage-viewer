const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
const useDebugServer = false;

function createWindow () {
  win = new BrowserWindow({width: 800, height: 600});

  if (useDebugServer) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadURL(url.format({
      pathname: path.resolve(__dirname, '..', '..', 'dist', 'index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  /* open dev tools */
  win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
