'use strict'

window.me = window.me || {}

{
	const PREFIX = 'tool_box_'
	const SELECTED_CLASSNAME = 'selected'
	const ITEM_CLASSNAME = 'tool_box_item'
	const TOOLBOX_TOOL_SELECTED = 'toolboxToolSelected'

	const clazz = class {
		constructor () {
			this.node = document.getElementById('tool_box')
			this._selectedItem = null
		}
		addItem (label, value) {
			var item = document.createElement('span')
			item.id = PREFIX + value
			item.className = ITEM_CLASSNAME
			item.innerHTML = label
			var toolbox = this
			item.addEventListener('click', function () {
				toolbox.selectedItem = this.id.substr(PREFIX.length)
			})
			this.node.appendChild(item)
		}
		set selectedItem (item) {
			var node
			if (item == this._selectedItem) {
				item = null
			}

			if (this._selectedItem != null) {
				node = document.getElementById(PREFIX + this._selectedItem)
				node.classList.remove(SELECTED_CLASSNAME)
			}
			this._selectedItem = item
			if (item) {
				node = document.getElementById(PREFIX + item)
				node.classList.add(SELECTED_CLASSNAME)
			}
			this.emitter.emit(TOOLBOX_TOOL_SELECTED, item)
		}
		get selectedItem () {
			return this._selectedItem
		}
	}
	clazz.TOOLBOX_TOOL_SELECTED = TOOLBOX_TOOL_SELECTED
	me.ToolBox = clazz
}
