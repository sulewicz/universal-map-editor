"use strict";

window.me = window.me || {};

me.MapIo = (function () {
	var MAP_FILE_LOADED = "map_file_loaded";
	var MAP_FILE_SAVED = "map_file_saved";

	var pathModule = require('path');
	var packObject = function (object, props) {
		var ret = object.pack();
		if (!ret) {
			ret = {};
			ret.x = object.x;
			ret.y = object.y;
			ret.id = object.id;

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
		}
		ret.type = object.type;
		return ret;
	};

	var save = function (path, map) {
		var self = this;
		var objects = map.objects;
		var output = {
			objects: []
		};

		if (map.export_path) {
			output.export_path = pathModule.relative(pathModule.dirname(path), map.export_path);
		}

		if (map.script) {
			output.script = map.script;
		}

		for (var i = 0; i < objects.length; ++i) {
			var packedObject = packObject(objects[i], objects[i].properties);
			output.objects.push(packedObject);
		}

		fs.writeFile(path, JSON.stringify(output), function (err) {
			if (err) {
				throw ('Could not write to file "' + filename + '": ' + err);
			}

			self.emitter.emit(MAP_FILE_SAVED, path);
		});
	};

	var unpackProperties = function (object, props, data) {
		var dynamic_props = [];
		for (var name in props) {
			if (props.hasOwnProperty(name)) {
				var prop = props[name];
				if (prop.type !== me.MapObjects.TYPE_DYNAMIC) {
					if (data.hasOwnProperty(name)) {
						object.updateStaticProperty(name, prop, data[name]);
					}
				} else {
					dynamic_props.push(name);
				}
			}
		}

		for (var i = 0; i < dynamic_props.length; ++i) {
			unpackProperties(object, object[dynamic_props[i]], data);
		}
	};

	var unpackObject = function (data, map_objects) {
		var ret = map_objects.createInstance(data.type, data.id, data.x, data.y);

		if (!ret.unpack(data)) {
			var props = ret.properties;
			unpackProperties(ret, props, data);
		}

		return ret;
	};

	var open = function (path, map, map_objects) {
		var self = this;
		fs.readFile(path, function (err, data) {
			if (err) {
				throw ('Could not read file "' + filename + '": ' + err);
			}

			var data = JSON.parse(data);
			map.reset();

			var objects = data.objects;
			for (var i = 0; i < objects.length; ++i) {
				var unpackedObject = unpackObject(objects[i], map_objects);
				map.addObject(unpackedObject);
			}

			if (data.export_path) {
				map.export_path = pathModule.resolve(pathModule.dirname(path), data.export_path);
			}

			if (data.script) {
				map.script = data.script;
			}

			self.emitter.emit(MAP_FILE_LOADED, path);
		});
	};

	var clazz = function (map, map_objects) {
		this.map = map;
		this.map_objects = map_objects;
	};

	clazz.prototype = {
		save: function (path) {
			save.call(this, path, this.map);
		},

		open: function (path) {
			open.call(this, path, this.map, this.map_objects);
		}
	};

	clazz.MAP_FILE_LOADED = MAP_FILE_LOADED;
	clazz.MAP_FILE_SAVED = MAP_FILE_SAVED;

	return clazz;
})();