"use strict";

window.me = window.me || {};

me.MapExporter = (function() {
	var MAP_FILE_EXPORTED = "map_file_exported";

	var packObject = function(object, props) {
		var ret = {};

		ret.x = object.x;
		ret.y = object.y;
		ret.id = object.id;
		ret.type = object.type;

		for (var name in props) {
			if (props.hasOwnProperty(name)) {
				var prop = props[name];
				if (prop.type === me.MapObjects.TYPE_DYNAMIC) {
					if (object[name]) {
						me.utils.mixin(ret, packObject(object, object[name]));
					}
				} else {
					ret[name] = object[name];
				}
			}
		}

		return ret;
	};

	var exportMap = function(path, map) {
		var self = this;
		var objects = map.objects;
		var output = {
			objects: []
		};

		if (map.script) {
			output.script = map.script;
		}

		for (var i = 0; i < objects.length; ++i) {
			var object = objects[i];
			var packedObject = object.compile ? object.compile(output) : packObject(object, object.properties);
			if (packedObject) {
				packedObject.type = object.type;
				output.objects.push(packedObject);
			}
		}

		fs.writeFile(path, JSON.stringify(output), function(err) {
			if (err) {
				throw ('Could not write to file "' + filename + '": ' + err);
			}

			self.emitter.emit(MAP_FILE_EXPORTED, path);
		});
	};

	var clazz = function(map) {
		this.map = map;
	};

	clazz.prototype = {
		exportMap: function(path) {
			exportMap.call(this, path, this.map);
		}
	};

	clazz.MAP_FILE_EXPORTED = MAP_FILE_EXPORTED;

	return clazz;
})();
