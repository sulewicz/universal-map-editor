'use strict'

window.me = window.me || {}

{
	const MAP_OBJECT_ADDED = 'map_object_added'
	const MAP_OBJECT_REMOVED = 'map_object_removed'

	const objectCompare = function (a, b) {
		if (a.zOrder < b.zOrder) {
			return -1
		} else if (a.zOrder > b.zOrder) {
			return 1
		} else {
			if (a.id < b.id) {
				return -1
			} else if (a.id > b.id) {
				return 1
			} else {
				return 0
			}
		}
	}

	const clazz = class {
		constructor () {
			this.objects_map = {}
			this.objects = []
			this.objects_by_depth = {}
			this._nextId = 0
		}
		addObject (obj) {
			while (this.objects_map.hasOwnProperty(obj.id)) {
				// Fixes duplicate ids
				obj.id++
			}
			this.objects.push(obj)
			this.objects.sort(objectCompare)
			this.objects_map[obj.id] = obj
			this.emitter.emit(MAP_OBJECT_ADDED, obj)
			this._nextId = Math.max(obj.id + 1, this._nextId)
			obj.onCreated()
		}
		removeObject (obj) {
			if (this.objects_map.hasOwnProperty(obj.id)) {
				delete this.objects_map[obj.id]
				var idx = this.objects.indexOf(obj)
				if (idx >= 0) {
					this.objects.splice(idx, 1)
					this.emitter.emit(MAP_OBJECT_REMOVED, obj)
				}
			}
		}
		scalePositions (factor) {
			for (var i = 0; i < this.objects.length; ++i) {
				var object = this.objects[i]
				object.scalePosition(factor)
			}
		}
		scaleAll (factor) {
			for (var i = 0; i < this.objects.length; ++i) {
				var object = this.objects[i]
				object.scalePosition(factor)
				object.scaleSize(factor)
			}
		}
		reset () {
			for (var i = 0; i < this.objects.length; ++i) {
				this.emitter.emit(MAP_OBJECT_REMOVED, this.objects[i])
			}
			this.objects.length = 0
			this._nextId = 0
			this.objects_map = {}
			this.export_path = null
		}
		get nextId () {
			return this._nextId
		}
	}

	clazz.MAP_OBJECT_ADDED = MAP_OBJECT_ADDED
	clazz.MAP_OBJECT_REMOVED = MAP_OBJECT_REMOVED
	me.Map = clazz
}
