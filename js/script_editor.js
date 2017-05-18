'use strict'

window.me = window.me || {}

{
  const FOCUS_DELAY = 500
  const RE = /[\w$]/

  const TOKEN_FOCUSED = 'scriptEditorTokenFocused'
  const INIT_EDITOR = 'scriptEditorInitialize'
  const CONTENT_CHANGED = 'scriptEditorContentChanged'

  const clazz = class {
    constructor (messageBus, scriptTokens) {
      this.messageBus = messageBus
      const codemirror = CodeMirror(document.getElementById('script_text_area'), {
        lineNumbers: true,
        autofocus: true,
        indentWithTabs: true,
        indentUnit: 4,
        viewportMargin: Infinity,
        mode: {
          name: 'lua',
          specials: scriptTokens || []
        }
      })
      this.codemirror = codemirror
      codemirror.on('change', function () {
        messageBus.send(CONTENT_CHANGED, codemirror.getValue())
      })
      codemirror.on('cursorActivity', (cm) => {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          this.updateFocus(cm)
        }, FOCUS_DELAY)
      })
      codemirror.refresh()
      codemirror.focus()
      messageBus.on(CONTENT_CHANGED, (content) => {
        codemirror.setValue(content || '')
        codemirror.refresh()
        codemirror.focus()
      })
    }
    updateFocus (cm) {
      var token
      if (!cm.somethingSelected()) {
        var cur = cm.getCursor(),
          line = cm.getLine(cur.line),
          start = cur.ch,
          end = start
        while (start && RE.test(line.charAt(start - 1))) {
          --start
        }
        while (end < line.length && RE.test(line.charAt(end))) {
          ++end
        }
        if (start < end) {
          token = line.slice(start, end)
        }
      } else {
        var from = cm.getCursor('from'),
          to = cm.getCursor('to')
        if (from.line != to.line) return
        var selection = cm.getRange(from, to).replace(/^\s+|\s+$/g, '')
        if (selection.length >= 0) {
          token = selection
        }
      }
      if (token && token != this.lastToken) {
        this.lastToken = token
        this.messageBus.send(TOKEN_FOCUSED, token)
      }
    }
  }
  clazz.TOKEN_FOCUSED = TOKEN_FOCUSED
  clazz.INIT_EDITOR = INIT_EDITOR
  clazz.CONTENT_CHANGED = CONTENT_CHANGED
  me.ScriptEditor = clazz
}
