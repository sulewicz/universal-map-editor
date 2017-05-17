'use strict'

window.me = window.me || {}

{
	const TYPE_INT = 'int'
	const TYPE_FLOAT = 'float'
	const TYPE_DYNAMIC = 'dynamic'
	const TYPE_ENUM = 'enum'
	const TYPE_BOOL = 'bool'
	const TYPE_TEXT = 'text'

	const OBJECT_RADIUS = 5
	const OBJECT_RADIUS_2 = OBJECT_RADIUS * 2

	const initProperties = function (obj, props) {
		props = props || {}
		for (var name in props) {
			if (props.hasOwnProperty(name)) {
				var prop = props[name]
				if (prop.type !== TYPE_DYNAMIC) {
					obj[name] = initStaticProperty(prop)
				}
			}
		}
		for (var name in props) {
			if (props.hasOwnProperty(name)) {
				var prop = props[name]
				if (prop.type === TYPE_DYNAMIC) {
					initDynamicProperty(obj, name, prop)
				}
			}
		}
	}

	const initStaticProperty = function (prop) {
		if (prop.type === TYPE_INT) {
			if (!prop.hasOwnProperty('min')) prop.min = -Infinity
			if (!prop.hasOwnProperty('max')) prop.max = Infinity
			if (!prop.hasOwnProperty('default')) prop.default = 0

			return (prop.default = Math.min(Math.max(prop.min, prop.default), prop.max))
		} else if (prop.type === TYPE_FLOAT) {
			if (!prop.hasOwnProperty('min')) prop.min = -Infinity
			if (!prop.hasOwnProperty('max')) prop.max = Infinity
			if (!prop.hasOwnProperty('default')) prop.default = 0

			return (prop.default = Math.min(Math.max(prop.min, prop.default), prop.max))
		} else if (prop.type === TYPE_ENUM) {
			if (!prop.hasOwnProperty('default')) prop.default = 0
			if (!prop.hasOwnProperty('values')) prop.values = [null]

			return prop.values[prop.default]
		} else if (prop.type === TYPE_BOOL) {
			if (!prop.hasOwnProperty('default')) prop.default = false
			prop.default = !!prop.default

			return prop.default
		} else if (prop.type === TYPE_TEXT) {
			if (!prop.hasOwnProperty('default')) prop.default = ''
			prop.default = String(prop.default)

			return prop.default
		}
	}

	const initDynamicProperty = function (obj, name, prop) {
		if (obj[name]) {
			var props = obj[name]
			for (var i = 0; i < props.length; ++i) {
				delete obj[props[i]]
			}
			obj[name] = null
		}
		obj[name] = prop.properties(obj[prop.baseProperty])
		var triggers = (obj._triggers = obj._triggers || {})
		if (!triggers.hasOwnProperty(prop.baseProperty)) {
			triggers[prop.baseProperty] = {}
		}
		triggers[prop.baseProperty][name] = true
		initProperties(obj, obj[name])
	}

	const baseTemplate = {
		wrapToGrid: function(position) {
			return me.utils.wrapToGrid(position)
		},
		updateStaticProperty: function (name, prop, value) {
			var ret = false
			if (prop.type === TYPE_INT) {
				value = Math.min(Math.max(prop.min, ~~value), prop.max)
			} else if (prop.type === TYPE_FLOAT) {
				value = Math.min(Math.max(prop.min, value), prop.max)
			} else if (prop.type === TYPE_ENUM) {
				value = (prop.values.indexOf(value) >= 0) ? value : prop.values[prop.default]
			} else if (prop.type === TYPE_BOOL) {
				value = !!value
			} else if (prop.type === TYPE_TEXT) {
				value = String(value)
			}
			this[name] = value
			this.onPropertyChanged(name, value)

			if (this.__onPropertyChanged) {
				this.__onPropertyChanged(this, name)
			}
			if (this._triggers && this._triggers.hasOwnProperty(name)) {
				var triggers = this._triggers[name]
				for (var triggerName in triggers) {
					if (triggers.hasOwnProperty(triggerName)) {
						initDynamicProperty(this, triggerName, this.properties[triggerName])
						ret = true
					}
				}
			}
			return ret
		},
		getLabel: function () {
			return this.label + ' [' + this.id + ']'
		},
		init: function (x, y) {
			this.x = x
			this.y = y
		},
		scalePosition: function (factor) {
			this.x = this.x * factor / 100
			this.y = this.y * factor / 100
		},
		scaleSize: function (factor) {},
		render: function (ctx, selectedObject) {
			ctx.fillStyle = selectedObject ? '#ff0000' : '#00ff00'
			ctx.fillRect(this.x - OBJECT_RADIUS, this.y - OBJECT_RADIUS, OBJECT_RADIUS_2, OBJECT_RADIUS_2)
		},
		contains: function (x, y) {
			return (x >= this.x - OBJECT_RADIUS_2 && x <= this.x + OBJECT_RADIUS_2 && y >= this.y - OBJECT_RADIUS_2 && y <= this.y + OBJECT_RADIUS_2)
		},
		onDelete: function () {
			return false
		},
		onMouseClick: function (pos) {
			return false
		},
		onMouseMove: function (pos) {},
		onMouseDrag: function (startPos, delta) {
			return false
		},
		onSelected: function () {},
		onUnselected: function () {},
		onPropertyChanged: function (name, value) {},
		onCreated: function () {},
		pack: function () {},
		unpack: function (data) {
			return false
		},
		invalidate: function() {
			me.Editor.getInstance().mapView.invalidate()
		},
		fillFrom: function(object, position) {
			for (var prop in this.properties) {
				if (this.properties.hasOwnProperty(prop)) {
					this[prop] = object[prop]
				}
			}
		}
	}

	const clazz = class {
		constructor () {
			this.classes = {}
		}
		createClasses (list) {
			// Adding objects from metadata:
			for (var i = 0; i < list.length; ++i) {
				this.createClass(list[i])
			}
		}
		createClass (template) {
			var classes = this.classes
			classes[template.type] = function (id, x, y) {
				initProperties(this, template.properties)
				this.id = id
				this.zOrder = template.zOrder || 0
				this.init(x, y)
			}
			classes[template.type].prototype = me.utils.mixin({}, template, baseTemplate)
			classes[template.type].type = template.type
			classes[template.type].label = template.label
		}
		createInstance (type, id, x, y) {
			return new this.classes[type](id, x, y)
		}
		getAvailableTypes () {
			var classes = this.classes
			var ret = []
			for (var type in classes) {
				if (classes.hasOwnProperty(type)) {
					ret.push({
						type: type,
						label: classes[type].label
					})
				}
			}
			return ret
		}
	}

	clazz.TYPE_INT = TYPE_INT
	clazz.TYPE_FLOAT = TYPE_FLOAT
	clazz.TYPE_DYNAMIC = TYPE_DYNAMIC
	clazz.TYPE_ENUM = TYPE_ENUM
	clazz.TYPE_BOOL = TYPE_BOOL
	clazz.TYPE_TEXT = TYPE_TEXT

	me.MapObjects = clazz
}
