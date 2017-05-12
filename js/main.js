'use strict'

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu

const path = require('path')
const url = require('url')

let mainWindow

function createMenu () {
  function clickCallback (menuItem) {
    mainWindow.webContents.send('menu', 'item_clicked', menuItem.id)
  }
  const template = [
    {
      label: 'File',
      id: 'file',
      submenu: [
         { label: 'Open', id: 'open_file', click: clickCallback, accelerator: 'CmdOrCtrl+O' },
         { label: 'Save', id: 'save_file', click: clickCallback, accelerator: 'CmdOrCtrl+S' },
         { label: 'Save As', id: 'save_file_as', click: clickCallback  },
         { label: 'Export', id: 'export_file', enabled: false, click: clickCallback, accelerator: 'CmdOrCtrl+E' },
         { label: 'Export As', id: 'export_file_as', enabled: false, click: clickCallback },
         { role: 'quit' }
      ]
    },
    {
      label: 'View',
      id: 'view',
      submenu: [
         { label: 'Map', id: 'map_view', click: clickCallback, type: 'radio', checked: true, accelerator: 'CmdOrCtrl+1' },
         { label: 'Script editor', id: 'editor_view', click: clickCallback, type: 'radio', checked: false, accelerator: 'CmdOrCtrl+2'  }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  electron.ipcMain.on('menu', (event, type, menuId, itemId, property, value) => {
    if (type === 'update_property') {
      var submenu = menu.items.find(x => x.id === menuId)
      if (submenu) {
        var items = submenu.submenu.items
        var item = items.find(x => x.id === itemId)
        if (item) {
          item[property] = value
        }
      }
    }
  })
}

function createWindow () {
  mainWindow = new BrowserWindow({width: 1024, height: 768})
  createMenu()
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
    show: false
  }))

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
