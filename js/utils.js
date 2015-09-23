"use strict";

window.me = window.me || {};

me.utils = (function () {
	return {
		triggerEvent: function (node, eventName) {
			var eventClass = "";

			switch (eventName) {
			case "click":
			case "mousedown":
			case "mouseup":
				eventClass = "MouseEvents";
				break;

			case "focus":
			case "change":
			case "blur":
			case "select":
				eventClass = "HTMLEvents";
				break;

			default:
				throw "Unknown event: " + eventName;
				break;
			}
			var ev = document.createEvent(eventClass);
			ev.initEvent(eventName, eventName == "change" ? false : true, true);
			ev.synthetic = true;
			node.dispatchEvent(ev, true);
		},

		mixin: function (dst) {
			if (arguments.length === 1) {
				return dst;
			}
			var obj = dst;
			for (var i = arguments.length - 1; i >= 1; --i) {
				for (var o in arguments[i]) {
					if (arguments[i].hasOwnProperty(o)) {
						obj[o] = arguments[i][o];
					}
				}
			}
			return obj;
		},
		
		wrapToGrid: function (position) {
			var editor = me.Editor.getInstance();
			var spacingX = editor.map_view.getGridHorizontalSpacing();
			var spacingY = editor.map_view.getGridVerticalSpacing();
			position.x = Math.round(position.x / spacingX) * spacingX;
			position.y = Math.round(position.y / spacingY) * spacingY;
			return position;
		}
	};
})();