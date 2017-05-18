'use strict'

window.me = window.me || {}

window.onload = function () {
  let messageBus = new me.MessageBus()
  messageBus.on(me.ScriptEditor.INIT_EDITOR, (tokens) => {
    new me.ScriptEditor(messageBus, tokens)
  })
}
