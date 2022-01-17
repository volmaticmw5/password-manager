import { app, BrowserWindow, Menu, MenuItem, ipcMain, ipcRenderer, contextBridge } from 'electron';
import * as path from 'path';
import * as config from './config'
import { cSession } from './session'

let mainWindow
global.user = new cSession();
let debug = process.execPath.match(/dist[\\/]electron/i)

// Load render(s)
require('./renderToMainImport')

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 900,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  if(config.HasMasterPassword())
    mainWindow.loadFile(path.join(__dirname, '../src/html/login.html'));
  else
    mainWindow.loadFile(path.join(__dirname, '../src/html/create_password.html'));
};

const menu = Menu.buildFromTemplate([
  {
    label: "File",
    submenu: [
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+Q' : 'Alt+Shift+Q',
        click: () => { app.quit() }
      }
    ]
  }
])

if(debug)
{
  menu.append(new MenuItem({
    label: "Development",
    submenu: [
      {
        label: 'Open devtools',
        click: () => {
          mainWindow.webContents.openDevTools();
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Open config file',
        click: () => {
          config.OpenConfigurationFile()
        }
      },
      {
        label: 'Purge config data',
        click: () => {
          config.Purge()
        }
      }
    ]
  }))
}

Menu.setApplicationMenu(menu)

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

ipcMain.on('createMasters', (event, arg) => {
  config.SetMastersPassword(arg.password)
  let res = user.Login(arg.password)
  if(res.result) {
    mainWindow.loadFile(path.join(__dirname, '../src/html/home.html'));
  }
});

ipcMain.on('GoHomeScreen', (event, args) => {
  if(global.user.isAuthenticated)
    mainWindow.loadFile(path.join(__dirname, '../src/html/home.html'));
  else
    mainWindow.loadFile(path.join(__dirname, '../src/html/login.html'));
})