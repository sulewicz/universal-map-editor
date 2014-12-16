"use strict";

window.me = window.me || {};

me.Map = (function () {
	var MAP_OBJECT_ADDED = "map_object_added";
	var MAP_OBJECT_REMOVED = "map_object_removed";

	var objectCompare = function (a, b) {
		if (a.zOrder < b.zOrder) {
			return -1;
		} else if (a.zOrder > b.zOrder) {
			return 1;
		} else {
			if (a.id < b.id) {
				return -1;
			} else if (a.id > b.id) {
				return 1;
			} else {
				return 0;
			}
		}
	}

	var clazz = function () {
		this.objects_map = {};
		this.objects = [];
		this.objects_by_depth = {};
		this.next_id = 0;
	};

	clazz.prototype = {
		addObject: function (obj) {
			while (this.objects_map.hasOwnProperty(obj.id)) {
				// Fixes duplicate ids
				obj.id++;
			}
			this.objects.push(obj);
			this.objects.sort(objectCompare);
			this.objects_map[obj.id] = obj;
			this.emitter.emit(MAP_OBJECT_ADDED, obj);
			this.next_id = Math.max(obj.id + 1, this.next_id);
		},

		removeObject: function (obj) {
			if (this.objects_map.hasOwnProperty(obj.id)) {
				delete this.objects_map[obj.id];
				var idx = this.objects.indexOf(obj);
				if (idx >= 0) {
					this.objects.splice(idx, 1);
					this.emitter.emit(MAP_OBJECT_REMOVED, obj);
				}
			}
		},

		scalePositions: function (factor) {
			for (var i = 0; i < this.objects.length; ++i) {
				var object = this.objects[i];
				object.scalePosition(factor);
			}
		},

		scaleAll: function (factor) {
			for (var i = 0; i < this.objects.length; ++i) {
				var object = this.objects[i];
				object.scalePosition(factor);
				object.scaleSize(factor);
			}
		},

		reset: function () {
			for (var i = 0; i < this.objects.length; ++i) {
				this.emitter.emit(MAP_OBJECT_REMOVED, this.objects[i]);
			}
			this.objects.length = 0;
			this.next_id = 0;
			this.objects_map = {};
		},

		getNextId: function () {
			return this.next_id;
		}
	};

	clazz.MAP_OBJECT_ADDED = MAP_OBJECT_ADDED;
	clazz.MAP_OBJECT_REMOVED = MAP_OBJECT_REMOVED;
	return clazz;
})();