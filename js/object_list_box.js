"use strict";

window.me = window.me || {};

me.ObjectListBox = (function () {
	var PREFIX = 'objects_list_box_';
	var SELECTED_CLASSNAME = 'selected';
	var ITEM_CLASSNAME = 'object_list_box_item';

	var LIST_OBJECT_CLICKED = 'list_object_clicked';

	var clazz = function (map) {
		this.map = map;
		this.node = document.getElementById('object_list_box');
		this.rebuild();
	};

	clazz.prototype = {
		createItem: function (obj) {
			var node = document.createElement('span');
			node.id = PREFIX + obj.id;
			node.className = ITEM_CLASSNAME;
			node.innerHTML = obj.getLabel();
			this.node.appendChild(node);
			node.addEventListener('click', function () {
				this.emitter.emit(LIST_OBJECT_CLICKED, obj);
			}.bind(this));
		},

		addObject: function (obj) {
			this.rebuild(obj, false);
		},

		updateObject: function (obj) {
			this.getNode(obj.id).innerHTML = obj.getLabel();
		},

		removeObject: function (obj) {
			this.rebuild(obj, true);
		},

		rebuild: function (obj, removed) {
			if (obj) {
				if (removed) {
					if (obj == this.selected_object) {
						this.selected_object = null;
					}
					var node = this.getNode(obj.id);
					node.parentNode.removeChild(node);
				} else {
					this.createItem(obj);
				}
			} else {
				this.selected_object = null;
				this.node.innerHTML = '';
				var objects = this.map.objects;
				for (var idx = 0; idx < objects.length; ++idx) {
					var obj = objects[idx];
					this.createItem(obj);
				}
			}
		},

		selectObject: function (obj) {
			if (this.selected_object) {
				this.getNode(this.selected_object.id).classList.remove(SELECTED_CLASSNAME);
			}
			this.selected_object = obj;
			if (obj) {
				this.getNode(this.selected_object.id).classList.add(SELECTED_CLASSNAME);
			}
		},

		getNode: function (id) {
			return document.getElementById(PREFIX + id);
		}
	};

	clazz.LIST_OBJECT_CLICKED = LIST_OBJECT_CLICKED;

	return clazz;
})();