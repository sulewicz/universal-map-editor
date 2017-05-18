'use strict'

const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu

const path = require('path')
const url = require('url')
const { MessageBus } = require('./message_bus')
const DEBUG = false

let mainWindow
let scriptEditorWindow

function initialize () {
  Menu.setApplicationMenu(null)
  createMainWindow()
  createScriptEditorWindow()
  new MessageBus([mainWindow, scriptEditorWindow])
}

function createMainMenu () {
  function clickCallback (menuItem) {
    mainWindow.webContents.send('menu', 'itemClicked', menuItem.id)
  }
  const template = [
    {
      label: 'File',
      id: 'file',
      submenu: [
         { label: 'Open', id: 'openFile', click: clickCallback, accelerator: 'CmdOrCtrl+O' },
         { label: 'Save', id: 'saveFile', click: clickCallback, accelerator: 'CmdOrCtrl+S' },
         { label: 'Save As', id: 'saveFileAs', click: clickCallback  },
         { label: 'Export', id: 'exportFile', enabled: false, click: clickCallback, accelerator: 'CmdOrCtrl+E' },
         { label: 'Export As', id: 'exportFileAs', enabled: false, click: clickCallback },
         { role: 'quit' }
      ]
    },
    {
      label: 'View',
      id: 'view',
      submenu: [
         { label: 'Show script editor', id: 'editorView', click: () => { scriptEditorWindow.show() }, accelerator: 'CmdOrCtrl+E'  }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  mainWindow.setMenu(menu)

  electron.ipcMain.on('menu', (event, type, menuId, itemId, property, value) => {
    if (type === 'updateProperty') {
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

function createScriptEditorWindow() {
  scriptEditorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false
  })
  scriptEditorWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../script_editor.html'),
    protocol: 'file:',
    slashes: true
  }))
  // Open the DevTools.
  if (DEBUG) {
    scriptEditorWindow.webContents.openDevTools()
  }

  scriptEditorWindow.on('close', (e) => {
    scriptEditorWindow.hide()
    e.preventDefault()
  })

  scriptEditorWindow.on('closed', () => {
    scriptEditorWindow = null
  })
}

function createMainWindow () {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false
  })
  createMainMenu()
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open the DevTools.
  if (DEBUG) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', function () {
    if (scriptEditorWindow) {
      scriptEditorWindow.close()
      scriptEditorWindow = null
    }
    mainWindow = null
    app.quit()
  })
}

app.on('ready', initialize)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createMainWindow()
  }
  if (scriptEditorWindow === null) {
    createScriptEditorWindow()
  }
})
