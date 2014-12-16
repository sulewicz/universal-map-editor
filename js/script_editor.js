"use strict";

window.me = window.me || {};

me.ScriptEditor = (function () {
	var SCRIPT_TOKEN_FOCUSED = "script_token_focused";
	var FOCUS_DELAY = 500;
	var RE = /[\w$]/;
	var clazz = function (map) {
		var self = this;
		var visible = false;
		this.map = map;
		this.node = document.getElementById('script_editor_pane');
		var codemirror = CodeMirror(document.getElementById('script_text_area'), {
			lineNumbers: true,
			autofocus: true,
			viewportMargin: Infinity,
			mode: {
				name: 'lua',
				specials: me.Metadata.script_tokens || []
			}
		});

		this.codemirror = codemirror;

		this.toggle = function () {
			visible = !visible;
			this.node.style.display = visible ? 'block' : 'none';
			codemirror.refresh();
			if (visible) {
				codemirror.focus();
			}
		}

		this.isVisible = function () {
			return visible;
		}

		codemirror.on('change', function () {
			map.script = codemirror.getValue();
		});

		codemirror.on('cursorActivity', function (cm) {
			clearTimeout(this.timeout);
			self.timeout = setTimeout(function () {
				self.updateFocus(cm);
			}, FOCUS_DELAY);
		});

	};

	clazz.prototype = {
		update: function () {
			this.codemirror.setValue(this.map.script || '');
		},

		updateFocus: function (cm) {
			var token;
			if (!cm.somethingSelected()) {
				var cur = cm.getCursor(),
					line = cm.getLine(cur.line),
					start = cur.ch,
					end = start;
				while (start && RE.test(line.charAt(start - 1))) {
					--start;
				}
				while (end < line.length && RE.test(line.charAt(end))) {
					++end;
				}
				if (start < end) {
					token = line.slice(start, end);
				}
			} else {
				var from = cm.getCursor("from"),
					to = cm.getCursor("to");
				if (from.line != to.line) return;
				var selection = cm.getRange(from, to).replace(/^\s+|\s+$/g, "");
				if (selection.length >= 0) {
					token = selection;
				}
			}
			if (token && token != this.last_token) {
				this.last_token = token;
				this.emitter.emit(SCRIPT_TOKEN_FOCUSED, token);
			}
		}
	};

	clazz.SCRIPT_TOKEN_FOCUSED = SCRIPT_TOKEN_FOCUSED;
	return clazz;
})();