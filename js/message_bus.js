'use strict'

{
  const { EventEmitter } = require('events')
  const electron = require('electron')
  const EVENT_NAME = 'messageBus'
  const MAIN_SENDER_NAME = 'main'

  const clazz = class {
    constructor (windows) {
      this._clientMode = (typeof window !== 'undefined')
      this._emitter = new EventEmitter()
      this.windows = windows
      if (this._clientMode) {
        electron.ipcRenderer.on(EVENT_NAME, (event, busEventName, senderName, ...rest) => {
          this._emitter.emit(busEventName, ...rest)
        })
      } else {
        electron.ipcMain.on(EVENT_NAME, (event, busEventName, senderName, ...rest) => {
          this._emitter.emit(busEventName, ...rest)
          // Forwarding to other clients
          this.windows.forEach((elem) => {
            if (!elem.isDestroyed() && elem.webContents.getURL() !== senderName) {
              elem.webContents.send(EVENT_NAME, busEventName, senderName, ...rest)
            }
          })
        })
      }
    }
    on (busEventName, callback) {
      this._emitter.on(busEventName, callback)
    }
    send (busEventName, ...rest) {
      if (this._clientMode) {
        electron.ipcRenderer.send(EVENT_NAME, busEventName, window.location.href, ...rest)
      } else {
        this.windows.forEach((elem) => {
          if (!elem.isDestroyed()) {
            elem.webContents.send(EVENT_NAME, busEventName, MAIN_SENDER_NAME, ...rest)
          }
        })
      }
    }
  }

  if (typeof window === 'undefined') {
    exports.MessageBus = clazz
  } else {
    window.me = window.me || {}
    me.MessageBus = clazz
  }
}
