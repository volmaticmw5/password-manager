import { app, BrowserWindow, Menu, dialog, MenuItem, ipcMain, ipcRenderer, contextBridge } from 'electron';
import * as path from 'path';
import * as config from './config'
import { cSession } from './session'
import UserData from './udata';

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
    width: 1050,
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
        label: 'Export passwords and notes',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+E' : 'Alt+Shift+E',
        click: () => {
          if(!global.user.isAuthenticated)
          {
            dialog.showErrorBox("Error", "You need to be logged in to export your passwords and notes!")
          }
          else
          {
            let filename = dialog.showSaveDialogSync(mainWindow, {
              title: "Export password and notes to file",
              defaultPath: "C:\\PasswordsAndNotes",
              buttonLabel: "Export"
            })

            const udata = new UserData()
            if(udata.FileExists())
              udata.ReadUserData()

            if(udata.GetData().length == 0)
            {
              dialog.showErrorBox("Error", "You don't have anything to export.")
              return
            }

            udata.ExportTo(filename)
            dialog.showMessageBox(mainWindow, {
              message: "File was successfully exported!",
              type: 'info',
              title: 'Export'
            })
          }
        }
      },
      {
        label: 'Import passwords and notes',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
        click: () => {
          if(!global.user.isAuthenticated)
          {
            dialog.showErrorBox("Error", "You need to be logged in to import passwords and notes!")
          }
          else
          {
            let res = dialog.showOpenDialogSync(mainWindow, {
              title: "Import password and notes to file",
              buttonLabel: "Import",
              properties: ['openFile']
            })

            const udata = new UserData()
            if(udata.FileExists())
              udata.ReadUserData()

            let importRes = udata.ImportFrom(res[0])
            if(importRes)
            {
              dialog.showMessageBox(mainWindow, {
                message: "Contents were successfully imported!",
                type: 'info',
                title: 'Import'
              })
              mainWindow.loadFile(path.join(__dirname, '../src/html/home.html'));
            }
            else
            {
              dialog.showErrorBox("Error", "Import action failed! Please check that you have selected the correct type of file.")
            }
          }
        }
      },
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