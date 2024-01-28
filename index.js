const {app, BrowserWindow, nativeTheme, ipcMain} = require("electron/main")
const path = require("path");
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('file_upwork.db', (err) => {
  if(err) {
    return console.error(err);
  }
  console.log('Connected to the db');
});

if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, 'node_modules', '.bin', 'electron') // Replace '${pathToElectron}' with the path to your Electron binary
    });
  }

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  nativeTheme.themeSource = "dark";
  win.loadFile('index.html')
  win.setMenuBarVisibility(false)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    db.close();
  }
})

ipcMain.on('search', (event, arg) => {
  let sql = `SELECT * FROM db_upwork WHERE CVEs LIKE ?`;

  db.all(sql, ['%' + arg + '%'], (err, rows) => {
    if (err) {
      event.sender.send('error', err.message);
      return console.error(err.message);
    }
    event.sender.send('search-result', rows);
});
})

ipcMain.on('open-url', (event, arg) => {
  require('electron').shell.openExternal(arg);
})