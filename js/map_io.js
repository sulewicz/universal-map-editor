'use strict'

window.me = window.me || {}

{
	const MAP_FILE_LOADED = 'mapFileLoaded'
	const MAP_FILE_SAVED = 'mapFileSaved'

	const pathModule = require('path')

	const packObject = function (object, props) {
		var ret = object.pack()
		if (!ret) {
			ret = {}
			ret.x = object.x
			ret.y = object.y
			ret.id = object.id

			for (var name in props) {
				if (props.hasOwnProperty(name)) {
					var prop = props[name]
					if (prop.type === me.MapObjects.TYPE_DYNAMIC) {
						if (object[name]) {
							me.utils.mixin(ret, packObject(object, object[name]))
						}
					} else {
						ret[name] = object[name]
					}
				}
			}
		}
		ret.type = object.type
		return ret
	}

	const unpackProperties = function (object, props, data) {
		var dynamicProps = []
		for (var name in props) {
			if (props.hasOwnProperty(name)) {
				var prop = props[name]
				if (prop.type !== me.MapObjects.TYPE_DYNAMIC) {
					if (data.hasOwnProperty(name)) {
						object.updateStaticProperty(name, prop, data[name])
					}
				} else {
					dynamicProps.push(name)
				}
			}
		}

		for (var i = 0; i < dynamicProps.length; ++i) {
			unpackProperties(object, object[dynamicProps[i]], data)
		}
	}

	const unpackObject = function (data, mapObjects) {
		var ret = mapObjects.createInstance(data.type, data.id, data.x, data.y)

		if (!ret.unpack(data)) {
			var props = ret.properties
			unpackProperties(ret, props, data)
		}

		return ret
	}

	const clazz = class {
		constructor (map, mapObjects) {
			this.map = map
			this.mapObjects = mapObjects
		}
		save (path) {
			var map = this.map
			var objects = map.objects
			var output = {
				objects: []
			}

			if (map.exportPath) {
				output.exportPath = pathModule.relative(pathModule.dirname(path), map.exportPath)
			}

			if (map.script) {
				output.script = map.script
			}

			for (var i = 0; i < objects.length; ++i) {
				var packedObject = packObject(objects[i], objects[i].properties)
				output.objects.push(packedObject)
			}

			fs.writeFile(path, JSON.stringify(output), (err) => {
				if (err) {
					alert('Could not write to file "' + path + '": ' + err)
					return
				}

				this.emitter.emit(MAP_FILE_SAVED, path)
			})
		}
		open (path) {
			var map = this.map
			var mapObjects = this.mapObjects
			fs.readFile(path, (err, data) => {
				if (err) {
					alert('Could not read file "' + path + '": ' + err)
					return
				}

				var data = JSON.parse(data)
				map.reset()

				var objects = data.objects
				for (var i = 0; i < objects.length; ++i) {
					var unpackedObject = unpackObject(objects[i], mapObjects)
					map.addObject(unpackedObject)
				}

				if (data.exportPath) {
					map.exportPath = pathModule.resolve(pathModule.dirname(path), data.exportPath)
				}

				if (data.script) {
					map.script = data.script
				}

				this.emitter.emit(MAP_FILE_LOADED, path)
			})
		}
	}

	clazz.MAP_FILE_LOADED = MAP_FILE_LOADED
	clazz.MAP_FILE_SAVED = MAP_FILE_SAVED

	me.MapIo = clazz
}
