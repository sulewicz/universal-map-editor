"use strict";

window.me = window.me || {};

var EventEmitter = require('events').EventEmitter;

me.EditorController = (function() {
	var TITLE = "Generic Map Editor";

	var updateTitle = function(path) {
		document.title = TITLE + " [" + path + "]";
	}

	var clazz = function(editor) {
		this.editor = editor;
		var emitter = new EventEmitter();
		editor.map.emitter = emitter;
		editor.object_list_box.emitter = emitter;
		editor.map_view.emitter = emitter;
		editor.tool_box.emitter = emitter;
		editor.properties_box.emitter = emitter;
		editor.map_io.emitter = emitter;
		editor.map_exporter.emitter = emitter;
		editor.menu_bar.emitter = emitter;
		editor.script_editor.emitter = emitter;
		this.emitter = emitter;
		this.forcePlacement = false;
		this.selected_object = null;
		this.init();
	};

	clazz.prototype = {
		init: function() {
			var editor = this.editor, emitter = this.emitter;

			document.body.addEventListener('keydown', function(e) {
				if (!editor.script_editor.isVisible()) {
					if (e.which == 16) {
						this.forcePlacement = true;
						e.preventDefault();
					}
				}
			}.bind(this), true);

			document.body.addEventListener('keyup', function(e) {
				if (!editor.script_editor.isVisible()) {
					if (e.which == 46) {
						if (this.selected_object) {
							if (!this.selected_object.onDelete()) {
								editor.map.removeObject(this.selected_object);
								e.preventDefault();
							}
						}
					} else if (e.which == 16) {
						this.forcePlacement = false;
						e.preventDefault();
					}
				}
			}.bind(this), true);

			emitter.on(me.MapView.MAP_MOUSE_MOVED, function(pos) {
				if (this.selected_object) {
					this.selected_object.onMouseMove.apply(this.selected_object, arguments);
				}
				editor.status_bar.update((this.forcePlacement && editor.tool_box.getSelectedItem() ? "Click to force create object at " : "") 
					+ "(" + pos.x.toFixed(2) + ", " + pos.y.toFixed(2) + ")");
			}.bind(this));

			emitter.on(me.MapView.MAP_MOUSE_CLICKED, function(pos) {
				var objs = this.findObjectsAt(pos.x, pos.y);
				if (objs.length > 0 && !this.forcePlacement) {
					if (objs.length == 1) {
                        if (objs[0] != this.selected_object) {
				            this.selectObject(objs[0], pos.x, pos.y);
                            return;
                        }
					} else {
						var objIdx = objs.indexOf(this.selected_object);
						var cycledObject = objs[(objIdx + objs.length - 1) % objs.length];
						this.selectObject(cycledObject, pos.x, pos.y);
                        return;
					}
				}
                if (!this.selected_object || !this.selected_object.onMouseClick.apply(this.selected_object, arguments)) {
                    var selectedType = editor.tool_box.getSelectedItem();
                    if (selectedType !== null) {
                        var object = editor.map_objects.createInstance(selectedType, editor.map.getNextId(), pos.x, pos.y);
                        if (this.selected_object && this.selected_object.type == object.type) {
                            for (var prop in object.properties) {
                                if (object.properties.hasOwnProperty(prop)) {
                                    object[prop] = this.selected_object[prop];
                                }
                            }
                        }
                        editor.map.addObject(object);
                        this.selectObject(object);
                    }
                }
			}.bind(this));

			emitter.on(me.MapView.MAP_MOUSE_DRAGGED, function(startPos, delta) {
				if (!startPos.hasOwnProperty('object')) {
					var objs = this.findObjectsAt(startPos.x, startPos.y);
					if (objs.indexOf(this.selected_object) >= 0) {
						startPos.object = this.selected_object;
					} else if (objs.length > 0) {
						startPos.object = objs[0];
					} else {
						startPos.object = null;
					}
					if (startPos.object) {
						this.selectObject(startPos.object, startPos.x, startPos.y)
						startPos.origin = { x: startPos.object.x, y: startPos.object.y };
					} else {
						startPos.origin = editor.map_view.getViewportInMapUnits();
					}
				}
				if (startPos.object) {
					if (!this.selected_object.onMouseDrag.apply(this.selected_object, arguments)) {
						startPos.object.x = startPos.origin.x + delta.x;
						startPos.object.y = startPos.origin.y + delta.y;
					}
				} else {
					editor.map_view.setViewportInMapUnits(startPos.origin.x - delta.x, startPos.origin.y - delta.y);
				}
			}.bind(this));

			emitter.on(me.ObjectListBox.LIST_OBJECT_CLICKED, function(obj) {
				this.selectObject(obj == this.selected_object ? null : obj);
			}.bind(this));

			emitter.on(me.Map.MAP_OBJECT_ADDED, function(obj) {
				editor.object_list_box.addObject(obj);
			}.bind(this));

			emitter.on(me.PropertiesBox.PROPERTIES_OBJECT_MODIFIED, function(obj, prop, value) {
				editor.object_list_box.updateObject(obj);
			}.bind(this));

			emitter.on(me.Map.MAP_OBJECT_REMOVED, function(obj) {
				if (this.selected_object == obj) {
					this.selectObject(null);
				}
				editor.object_list_box.removeObject(obj);
			}.bind(this));

			emitter.on(me.ToolBox.TOOLBOX_TOOL_SELECTED, function(item) {
				if (this.selected_object && this.selected_object.type != item) {
					this.selectObject(null);
				}
			}.bind(this));

			emitter.on(me.MapIo.MAP_FILE_LOADED, function(path) {
				updateTitle(path);
				editor.status_bar.update("[" + (new Date().toLocaleTimeString()) + "] Loaded: " + path);
				editor.script_editor.update();
			}.bind(this));

			emitter.on(me.MapIo.MAP_FILE_SAVED, function(path) {
				updateTitle(path);
				editor.status_bar.update("[" + (new Date().toLocaleTimeString()) + "] Saved: " + path);
			}.bind(this));

			emitter.on(me.MapExporter.MAP_FILE_EXPORTED, function(path) {
				updateTitle(path);
				editor.status_bar.update("[" + (new Date().toLocaleTimeString()) + "] Exported: " + path);
			}.bind(this));

			emitter.on(me.MenuBar.TOGGLE_SCRIPT_EDITOR, function() {
				editor.script_editor.toggle();
			}.bind(this));

			if (me.Metadata.findObjectForToken) {
				emitter.on(me.ScriptEditor.SCRIPT_TOKEN_FOCUSED, function(token) {
					var object = me.Metadata.findObjectForToken(token, editor.map.objects);
					if (object) {
						this.selectObject(object);
					}
				}.bind(this));
			}
		},

		selectObject: function(obj, x, y) {
			if (this.selected_object) {
				this.selected_object.onUnselected();
			}
			this.selected_object = obj;
			if (this.selected_object) {
				this.selected_object.onSelected(x, y);
			}
			this.editor.map_view.selectObject(obj);
			this.editor.object_list_box.selectObject(obj);
			this.editor.properties_box.selectObject(obj);
		},

		getSelectedObject: function() {
			return this.selected_object;
		},

		findObjectsAt: function(x, y) {
			var objects = this.editor.map.objects;
			var ret = [];
			for (var idx = objects.length - 1; idx >= 0; --idx) {
				var obj = objects[idx];
				if (obj.contains(x, y)) {
					ret.push(obj);
				}
			}
			return ret;
		}
	};

	return clazz;
})();
