"use strict";

window.me = window.me || {};

me.StatusBar = (function () {
	var clazz = function () {
		this.node = document.getElementById('status_bar');
	};

	clazz.prototype = {
		update: function (text) {
			this.node.innerHTML = text;
		}
	};

	return clazz;
})();