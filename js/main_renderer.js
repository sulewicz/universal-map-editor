'use strict'

window.me = window.me || {}

window.onload = function () {
  const path = require('path')
  const editorNode = document.getElementById('editor')
  const errorNode = document.getElementById('error')
  if (me.Metadata) {
    editorNode.style.display = 'block'
    var editor = new me.Editor()
    let messageBus = new me.MessageBus()
    messageBus.send(me.ScriptEditor.INIT_EDITOR, me.Metadata.scriptTokens)
    new me.EditorController(editor, messageBus)
  } else {
    errorNode.innerHTML = 'No <b>gameMetadata.js</b> file found in ' + path.resolve(__dirname, '../../') + '.<br>You can copy one from ' + path.resolve(__dirname, '../sample/') + '.'
    errorNode.style.display = 'block'
  }
}
