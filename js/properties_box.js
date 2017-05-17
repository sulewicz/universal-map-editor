'use strict'

window.me = window.me || {}

{
	const PROPERTIES_OBJECT_MODIFIED = 'propertiesObjectModified'
	const PROPERTIES_FIELD_FOCUSED = 'propertiesFieldFocused'

	const fieldsFactory = {}
	fieldsFactory[me.MapObjects.TYPE_INT] = function (obj, name, prop) {
		var node = document.createElement('div')
		node.className = 'property'
		node.innerHTML = '<span class="property_name">' + name + ':</span><input class="property_value" type="number"></input>'
		node.children[1].value = obj[name]
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, this.value)) {
				this.value = obj[name]
			}
		}, true)
		this.node.appendChild(node)
		this.nodes[name] = node
		return node
	}

	fieldsFactory[me.MapObjects.TYPE_FLOAT] = function (obj, name, prop) {
		var node = document.createElement('div')
		node.className = 'property'
		node.innerHTML = '<span class="property_name">' + name + ':</span><input class="property_value" type="number"></input>'
		node.children[1].value = obj[name]
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, this.value)) {
				this.value = obj[name]
			}
		}, true)
		this.node.appendChild(node)
		this.nodes[name] = node
		return node
	}

	fieldsFactory[me.MapObjects.TYPE_ENUM] = function (obj, name, prop) {
		var node = document.createElement('div')
		node.className = 'property'
		var options = []
		for (var i = 0; i < prop.values.length; ++i) {
			var option = prop.values[i] || ''
			options.push('<option value="' + option + '">' + option + '</option>')
		}
		node.innerHTML = '<span class="property_name">' + name + ':</span><select class="property_value">' + options.join('') + '</select>'
		node.children[1].value = obj[name]
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, this.value)) {
				this.value = obj[name]
			}
		}, true)
		this.node.appendChild(node)
		this.nodes[name] = node
		return node
	}

	fieldsFactory[me.MapObjects.TYPE_BOOL] = function (obj, name, prop) {
		var node = document.createElement('div')
		node.className = 'property'
		node.innerHTML = '<span class="property_name">' + name + ':</span><select class="property_value">' + '<option value="1">true</option>' + '<option value="0">false</option>' + '</select>'
		node.children[1].value = obj[name] ? '1' : '0'
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, 0 | this.value)) {
				this.value = obj[name] ? '1' : '0'
			}
		}, true)
		this.node.appendChild(node)
		this.nodes[name] = node
		return node
	}

	fieldsFactory[me.MapObjects.TYPE_DYNAMIC] = function (obj, name, prop) {
		var props = obj[name]
		if (props) {
			initProperties.call(this, props)
		}
	}

	fieldsFactory[me.MapObjects.TYPE_TEXT] = function (obj, name, prop) {
		var node = document.createElement('div')
		node.className = 'property'
		node.innerHTML = '<span class="property_name">' + name + ':</span><input class="property_value" type="text"></input>'
		node.children[1].value = obj[name]
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, this.value)) {
				this.value = obj[name]
			}
		}, true)
		this.node.appendChild(node)
		this.nodes[name] = node
		return node
	}

	function initProperties (props) {
		var emitter = this.emitter
		props = props || {}
		for (var name in props) {
			if (props.hasOwnProperty(name)) {
				var selectedObject = this._selectedObject
				var propSpec = props[name]
				var node = fieldsFactory[propSpec.type].call(this, selectedObject, name, propSpec)
				node.addEventListener('mouseenter', (function (object, name, propSpec) {
					return function () {
						emitter.emit(PROPERTIES_FIELD_FOCUSED, object, name, propSpec)
					}
				})(selectedObject, name, propSpec))
			}
		}
	}

	function objectModified (object, propName) {
		this.nodes[propName].children[1].value = object[propName]
		this.emitter.emit(PROPERTIES_OBJECT_MODIFIED, object, propName, object[propName])
	}

	const clazz = class {
		constructor () {
			this.node = document.getElementById('properties_box')
			this.nodes = {}
			this._selectedObject = null
		}
		set selectedObject (obj) {
			if (this._selectedObject) {
				this._selectedObject.__onPropertyChanged = null
			}
			this._selectedObject = obj
			if (this._selectedObject) {
				this._selectedObject.__onPropertyChanged = objectModified.bind(this)
			}
			this.build()
		}
		get selectedObject () {
			return this._selectedObject
		}
		build () {
			this.node.innerHTML = ''
			this.nodes = {}
			if (this._selectedObject) {
				initProperties.call(this, this._selectedObject.properties)
			}
		}
	}
	clazz.PROPERTIES_OBJECT_MODIFIED = PROPERTIES_OBJECT_MODIFIED
	clazz.PROPERTIES_FIELD_FOCUSED = PROPERTIES_FIELD_FOCUSED

	me.PropertiesBox = clazz
}
