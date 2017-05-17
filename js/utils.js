'use strict'

window.me = window.me || {}

me.utils = {
	triggerEvent (node, eventName) {
		var eventClass = ''

		switch (eventName) {
			case 'click':
			case 'mousedown':
			case 'mouseup':
			eventClass = 'MouseEvents'
			break

			case 'focus':
			case 'change':
			case 'blur':
			case 'select':
			eventClass = 'HTMLEvents'
			break

			default:
			throw 'Unknown event: ' + eventName
			break
		}
		var ev = document.createEvent(eventClass)
		ev.initEvent(eventName, eventName == 'change' ? false : true, true)
		ev.synthetic = true
		node.dispatchEvent(ev, true)
	},
	mixin (dst, ...rest) {
		var obj = dst
		if (rest.length > 0) {
			for (var i = rest.length - 1; i >= 0; --i) {
				for (var o in rest[i]) {
					if (rest[i].hasOwnProperty(o)) {
						obj[o] = rest[i][o]
					}
				}
			}
		}
		return obj
	},
	wrapToGrid (position) {
		var editor = me.Editor.getInstance()
		var spacingX = editor.mapView.getGridHorizontalSpacing()
		var spacingY = editor.mapView.getGridVerticalSpacing()
		position.x = Math.round(position.x / spacingX) * spacingX
		position.y = Math.round(position.y / spacingY) * spacingY
		return position
	}
}
