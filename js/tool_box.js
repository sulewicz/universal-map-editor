"use strict";

window.me = window.me || {};

me.ToolBox = (function () {
	var PREFIX = 'tool_box_';
	var SELECTED_CLASSNAME = 'selected';
	var ITEM_CLASSNAME = 'tool_box_item';
	var TOOLBOX_TOOL_SELECTED = 'toolbox_tool_selected';

	var clazz = function () {
		this.node = document.getElementById('tool_box');
		this.selected_item = null;
	};

	clazz.prototype = {
		addItem: function (label, value) {
			var item = document.createElement('span');
			item.id = PREFIX + value;
			item.className = ITEM_CLASSNAME;
			item.innerHTML = label;
			var toolbox = this;
			item.addEventListener('click', function () {
				toolbox.setSelectedItem(this.id.substr(PREFIX.length));
			});
			this.node.appendChild(item);
		},

		setSelectedItem: function (item) {
			var node;
			if (item == this.selected_item) {
				item = null;
			}
			
			if (this.selected_item != null) {
				node = document.getElementById(PREFIX + this.selected_item);
				node.classList.remove(SELECTED_CLASSNAME);
			}
			this.selected_item = item;
			if (item) {
				node = document.getElementById(PREFIX + item);
				node.classList.add(SELECTED_CLASSNAME);
			}
			this.emitter.emit(TOOLBOX_TOOL_SELECTED, item);
		},

		getSelectedItem: function () {
			return this.selected_item;
		}
	};

	clazz.TOOLBOX_TOOL_SELECTED = TOOLBOX_TOOL_SELECTED;

	return clazz;
})();