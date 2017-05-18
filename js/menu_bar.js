'use strict'

window.me = window.me || {}

{
  const electron = require('electron')
  const remote = electron.remote

  const updateMenuItem = function (menuId, itemId, property, value) {
    electron.ipcRenderer.send('menu', 'updateProperty', menuId, itemId, property, value)
  }

  const updateExportButtonsVisibility = function () {
    if (this.mapPath) {
      updateMenuItem('file', 'exportFile', 'enabled', true)
      updateMenuItem('file', 'exportFileAs', 'enabled', true)
    } else {
      updateMenuItem('file', 'exportFile', 'enabled', false)
      updateMenuItem('file', 'exportFileAs', 'enabled', false)
    }
  }

  const clazz = class {
    constructor (mapIo, mapExporter) {
      var callbacks = {}

      this.mapIo = mapIo
      this.mapExporter = mapExporter

      electron.ipcRenderer.on('menu', (event, type, id) => {
        if (type === 'itemClicked') {
          if (callbacks.hasOwnProperty(id)) {
            callbacks[id](id)
          }
        }
      })

      const addClickListener = (id, callback) => {
        callbacks[id] = callback
      }

      const showSaveDialog = () => {
        remote.dialog.showSaveDialog({
          filters: [ { name: 'JSON', extensions: ['json'] }, { name: 'All files', extensions: ['*'] } ]
        }, (fileName) => {
          if (fileName) {
            this.save(fileName)
          }
        })
      }

      const showExportDialog = () => {
        remote.dialog.showSaveDialog({
          filters: [ { name: 'Exported Level', extensions: ['lvl'] }, { name: 'All files', extensions: ['*'] } ]
        }, (fileName) => {
          if (fileName) {
            this.mapIo.map.exportPath = fileName
            this.save(this.mapPath)
            this.export(fileName)
          }
        })
      }

      const showOpenDialog = () => {
        remote.dialog.showOpenDialog({
          filters: [ { name: 'JSON', extensions: ['json'] }, { name: 'All files', extensions: ['*'] } ]
        }, (fileNames) => {
          if (fileNames) {
            this.open(fileNames[0])
          }
        })
      }

      addClickListener('saveFile', () => {
        if (this.mapPath) {
          this.save(this.mapPath)
        } else {
          showSaveDialog()
        }
      })

      addClickListener('saveFileAs', () => {
        showSaveDialog()
      })

      addClickListener('openFile', () => {
        showOpenDialog()
      })

      addClickListener('exportFile', () => {
        if (this.exportPath || (this.exportPath = this.mapIo.map.exportPath)) {
          this.save(this.mapPath)
          this.export(this.exportPath)
        } else {
          showExportDialog()
        }
      })

      addClickListener('exportFileAs', () => {
        showExportDialog()
      })
    }
    save (path) {
      try {
        this.mapIo.save(path)
        this.mapPath = path
        updateExportButtonsVisibility.call(this)
      } catch (e) {
        alert('Error while saving map: ' + e)
      }
    }
    open (path) {
      try {
        this.mapIo.open(path)
        this.mapPath = path
        updateExportButtonsVisibility.call(this)
      } catch (e) {
        alert('Error while loading map: ' + e)
      }
    }
    export (path) {
      try {
        this.mapExporter.exportMap(path)
        this.exportPath = path
      } catch (e) {
        alert('Error while exporting map: ' + e)
      }
    }
  }

  me.MenuBar = clazz
}
