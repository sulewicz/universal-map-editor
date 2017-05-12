'use strict'

window.me = window.me || {}

var EventEmitter = require('events').EventEmitter
{
	const TITLE = 'Generic Map Editor'

	const updateTitle = function (path) {
		document.title = TITLE + ' [' + path + ']'
	}

	const clazz = class {
		constructor (editor) {
			this.editor = editor
			const emitter = new EventEmitter()
			editor.map.emitter = emitter
			editor.object_list_box.emitter = emitter
			editor.map_view.emitter = emitter
			editor.tool_box.emitter = emitter
			editor.properties_box.emitter = emitter
			editor.map_io.emitter = emitter
			editor.map_exporter.emitter = emitter
			editor.menu_bar.emitter = emitter
			editor.script_editor.emitter = emitter
			editor.map_tools_pane.emitter = emitter
			this.emitter = emitter
			this.forcePlacement = false
			this._selectedObject = null
			this.filter_type = null
			this.init()
		}
		init () {
			var editor = this.editor
			var emitter = this.emitter

			document.body.addEventListener('keydown', (e) => {
				if (!editor.script_editor.visible) {
					if (e.which == 16) {
						this.forcePlacement = true
						e.preventDefault()
					}
				}
			}, true)

			document.body.addEventListener('keyup', (e) => {
				if (!editor.script_editor.visible) {
					if (e.which == 46) {
						if (this._selectedObject) {
							if (!this._selectedObject.onDelete()) {
								editor.map.removeObject(this._selectedObject)
								e.preventDefault()
							}
						}
					} else if (e.which == 16) {
						this.forcePlacement = false
						e.preventDefault()
					}
				}
			}, true)

			emitter.on(me.MapPane.MAP_MOUSE_MOVED, (pos, e) => {
				if (this._selectedObject) {
					this._selectedObject.onMouseMove.call(this._selectedObject, pos, e)
					editor.map_view.invalidate()
				}
				editor.status_bar.update((this.forcePlacement && editor.tool_box.selectedItem ? 'Click to force create object at ' : '') + '(' + pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ')')
			})

			emitter.on(me.MapPane.MAP_MOUSE_CLICKED, (pos, e) => {
				if (this._selectedObject && !this.forcePlacement && this._selectedObject.onMouseClick.call(this._selectedObject, pos, e)) {
					editor.map_view.invalidate()
				} else if (e.button == 1) {
					// Dragging with middle button
					editor.map_view.invalidate()
				} else {
					var objs = this.findObjectsAt(pos.x, pos.y, this.filter_type)
					// Cycling through found objects, unless forced placement is activated
					if (objs.length > 0 && !this.forcePlacement) {
						var objectToSelect = null
						if (objs.length == 1) {
							objectToSelect = objs[0]
						} else {
							var objIdx = objs.indexOf(this._selectedObject)
							objectToSelect = objs[(objIdx + objs.length - 1) % objs.length]
						}
						if (objectToSelect) {
							this.selectObject(objectToSelect, pos.x, pos.y)
							return
						}
					}
					// Empty space on map clicked or forced placement is activated
					var selectedType = editor.tool_box.selectedItem
					if (selectedType !== null) {
						if (e.altKey) {
							pos = me.utils.wrapToGrid(pos)
						}
						var object = editor.map_objects.createInstance(selectedType, editor.map.nextId, pos.x, pos.y)
						if (this._selectedObject && this._selectedObject.type == object.type) {
							object.fillFrom(this._selectedObject, pos)
						}
						editor.map.addObject(object)
						this.selectObject(object)
					}
					editor.map_view.invalidate()
				}
			})

			emitter.on(me.MapPane.MAP_MOUSE_DRAGGED, (startPos, delta, e) => {
				if (!this._selectedObject || !this._selectedObject.onMouseDrag.call(this._selectedObject, startPos, delta, e)) {
					if (!startPos.hasOwnProperty('object')) {
						if (e.button == 1) {
							// Dragging map on middle button
							startPos.object = null
						} else {
							var objs = this.findObjectsAt(startPos.x, startPos.y, this.filter_type)
							if (objs.indexOf(this._selectedObject) >= 0) {
								startPos.object = this._selectedObject
							} else if (objs.length > 0) {
								startPos.object = objs[0]
							} else {
								startPos.object = null
							}
						}
						if (startPos.object) {
							this.selectObject(startPos.object, startPos.x, startPos.y)
							startPos.origin = {
								x: startPos.object.x,
								y: startPos.object.y
							}
						} else {
							startPos.origin = editor.map_view.getViewportInMapUnits()
						}
					} else {
						if (startPos.object) {
							startPos.object.x = startPos.origin.x + delta.x
							startPos.object.y = startPos.origin.y + delta.y
							if (e.altKey) {
								startPos.object.wrapToGrid(startPos.object)
							}
						} else {
							editor.map_view.setViewportInMapUnits(startPos.origin.x - delta.x, startPos.origin.y - delta.y)
						}
					}
					editor.map_view.invalidate()
				}
			})

			emitter.on(me.ObjectListBox.LIST_OBJECT_CLICKED, (obj) => {
				this.selectObject(obj == this._selectedObject ? null : obj)
			})

			emitter.on(me.Map.MAP_OBJECT_ADDED, (obj) => {
				editor.object_list_box.addObject(obj)
				editor.map_view.invalidate()
			})

			emitter.on(me.PropertiesBox.PROPERTIES_OBJECT_MODIFIED, (object, propName, value) => {
				editor.object_list_box.updateObject(object)
				editor.map_view.invalidate()
			})
			emitter.on(me.PropertiesBox.PROPERTIES_FIELD_FOCUSED, (object, name, propSpec) => {
				if (propSpec.hint) {
					editor.status_bar.update(name + ': ' + propSpec.hint)
				} else {
					editor.status_bar.update('')
				}
			})

			emitter.on(me.Map.MAP_OBJECT_REMOVED, (obj) => {
				if (this._selectedObject == obj) {
					this.selectObject(null)
				}
				editor.object_list_box.removeObject(obj)
				editor.map_view.invalidate()
			})

			emitter.on(me.ToolBox.TOOLBOX_TOOL_SELECTED, (item) => {
				if (this._selectedObject && this._selectedObject.type != item) {
					this.selectObject(null)
				}
				this.filter_type = item
				editor.object_list_box.filterList(item)
				editor.map_view.filterMap(item)
			})

			emitter.on(me.MapIo.MAP_FILE_LOADED, (path) => {
				updateTitle(path)
				editor.status_bar.update('[' + (new Date().toLocaleTimeString()) + '] Loaded: ' + path)
				editor.script_editor.update()
				editor.map_view.invalidate()
			})

			emitter.on(me.MapIo.MAP_FILE_SAVED, (path) => {
				updateTitle(path)
				editor.status_bar.update('[' + (new Date().toLocaleTimeString()) + '] Saved: ' + path)
			})

			emitter.on(me.MapExporter.MAP_FILE_EXPORTED, (path) => {
				updateTitle(path)
				editor.status_bar.update('[' + (new Date().toLocaleTimeString()) + '] Exported: ' + path)
			})

			emitter.on(me.MenuBar.SHOW_MAP_VIEW, () => {
				editor.script_editor.hide()
			})

			emitter.on(me.MenuBar.SHOW_EDITOR_VIEW, () => {
				editor.script_editor.show()
			})

			emitter.on(me.MapToolsPane.MAP_OBJECTS_MODIFIED, () => {
				editor.properties_box.build()
				editor.map_view.invalidate()
			})

			if (me.Metadata.findObjectForToken) {
				emitter.on(me.ScriptEditor.SCRIPT_TOKEN_FOCUSED, (token) => {
					var object = me.Metadata.findObjectForToken(token, editor.map.objects)
					if (object) {
						this.selectObject(object)
					}
				})
			}
		}
		selectObject (obj, x, y) {
			if (this._selectedObject) {
				this._selectedObject.onUnselected()
			}
			this._selectedObject = obj
			if (this._selectedObject) {
				this._selectedObject.onSelected(x, y)
			}
			this.editor.map_view.selectedObject = obj
			this.editor.object_list_box.selectedObject = obj
			this.editor.properties_box.selectedObject = obj
			this.editor.map_view.invalidate()
		}
		get selectedObject () {
			return this._selectedObject
		}
		findObjectsAt (x, y, type) {
			var objects = this.editor.map.objects
			var ret = []
			for (var idx = objects.length - 1; idx >= 0; --idx) {
				var obj = objects[idx]
				if (obj.contains(x, y) && (!type || obj.type === type)) {
					ret.push(obj)
				}
			}
			return ret
		}
	}

	me.EditorController = clazz
}
