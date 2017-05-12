'use strict'

window.me = window.me || {}

{
	const SCRIPT_TOKEN_FOCUSED = 'script_token_focused'
	const FOCUS_DELAY = 500
	const RE = /[\w$]/

	const clazz = class {
		constructor (map) {
			this._visible = false
			this.map = map
			this.node = document.getElementById('script_editor_pane')
			const codemirror = CodeMirror(document.getElementById('script_text_area'), {
				lineNumbers: true,
				autofocus: true,
				indentWithTabs: true,
				indentUnit: 4,
				viewportMargin: Infinity,
				mode: {
					name: 'lua',
					specials: me.Metadata.script_tokens || []
				}
			})
			this.codemirror = codemirror
			codemirror.on('change', function () {
				map.script = codemirror.getValue()
			})
			codemirror.on('cursorActivity', (cm) => {
				clearTimeout(this.timeout)
				this.timeout = setTimeout(() => {
					this.updateFocus(cm)
				}, FOCUS_DELAY)
			})
		}
		update () {
			this.codemirror.setValue(this.map.script || '')
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
			if (token && token != this.last_token) {
				this.last_token = token
				this.emitter.emit(SCRIPT_TOKEN_FOCUSED, token)
			}
		}
		hide () {
			this._visible = false
			this.updateVisibility()
		}
		show () {
			this._visible = true
			this.updateVisibility()
		}
		updateVisibility () {
			this.node.style.display = this._visible ? 'block' : 'none'
			this.codemirror.refresh()
			if (this._visible) {
				this.codemirror.focus()
			}
		}
		get visible () {
			return this._visible
		}
	}
	clazz.SCRIPT_TOKEN_FOCUSED = SCRIPT_TOKEN_FOCUSED
	me.ScriptEditor = clazz
}
