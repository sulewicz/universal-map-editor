'use strict'

window.me = window.me || {}

{
	const clazz = class {
		constructor () {
			this.node = document.getElementById('status_bar')
		}
		update (text) {
			this.node.innerHTML = text
		}
	}
	me.StatusBar = clazz
}
