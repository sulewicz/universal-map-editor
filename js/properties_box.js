"use strict";

window.me = window.me || {};

me.PropertiesBox = (function () {
	var PROPERTIES_OBJECT_MODIFIED = "properties_object_modified";

	var fieldsFactory = {};
	fieldsFactory[me.MapObjects.TYPE_INT] = function (obj, name, prop) {
		var self = this;
		var node = document.createElement('div');
		node.className = 'property';
		node.innerHTML = '<span class="property_name">' + name + ':</span><input class="property_value" type="number"></input>';
		node.children[1].value = obj[name];
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, this.value)) {
				this.value = obj[name];
			}
		}, true);
		this.node.appendChild(node);
		this.nodes[name] = node;
	};

	fieldsFactory[me.MapObjects.TYPE_FLOAT] = function (obj, name, prop) {
		var self = this;
		var node = document.createElement('div');
		node.className = 'property';
		node.innerHTML = '<span class="property_name">' + name + ':</span><input class="property_value" type="number"></input>';
		node.children[1].value = obj[name];
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, this.value)) {
				this.value = obj[name];
			}
		}, true);
		this.node.appendChild(node);
		this.nodes[name] = node;
	};

	fieldsFactory[me.MapObjects.TYPE_ENUM] = function (obj, name, prop) {
		var self = this;
		var node = document.createElement('div');
		node.className = 'property';
		var options = [];
		for (var i = 0; i < prop.values.length; ++i) {
			var option = prop.values[i] || '';
			options.push('<option value="' + option + '">' + option + '</option>');
		}
		node.innerHTML = '<span class="property_name">' + name + ':</span><select class="property_value">' + options.join('') + '</select>';
		node.children[1].value = obj[name];
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, this.value)) {
				this.value = obj[name];
			}
		}, true);
		this.node.appendChild(node);
		this.nodes[name] = node;
	};

	fieldsFactory[me.MapObjects.TYPE_BOOL] = function (obj, name, prop) {
		var self = this;
		var node = document.createElement('div');
		node.className = 'property';
		node.innerHTML = '<span class="property_name">' + name + ':</span><select class="property_value">' + '<option value="1">true</option>' + '<option value="0">false</option>' + '</select>';
		node.children[1].value = obj[name] ? '1' : '0';
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, 0 | this.value)) {
				this.value = obj[name] ? '1' : '0';
			}
		}, true);
		this.node.appendChild(node);
		this.nodes[name] = node;
	};

	fieldsFactory[me.MapObjects.TYPE_DYNAMIC] = function (obj, name, prop) {
		var props = obj[name];
		if (props) {
			initProperties.call(this, props);
		}
	};

	fieldsFactory[me.MapObjects.TYPE_TEXT] = function (obj, name, prop) {
		var self = this;
		var node = document.createElement('div');
		node.className = 'property';
		node.innerHTML = '<span class="property_name">' + name + ':</span><input class="property_value" type="text"></input>';
		node.children[1].value = obj[name];
		node.children[1].addEventListener('change', function (e) {
			if (!obj.updateStaticProperty(name, prop, this.value)) {
				this.value = obj[name];
			}
		}, true);
		this.node.appendChild(node);
		this.nodes[name] = node;
	};

	var initProperties = function (props) {
		props = props || {};
		for (var name in props) {
			if (props.hasOwnProperty(name)) {
				var prop = props[name];
				fieldsFactory[prop.type].call(this, this.selected_object, name, prop);
			}
		}
	}

	var objectModified = function (object, prop) {
		this.nodes[prop].children[1].value = object[prop];
		this.emitter.emit(PROPERTIES_OBJECT_MODIFIED, object, prop, object[prop]);
	};

	var clazz = function () {
		this.node = document.getElementById('properties_box');
		this.nodes = {};
	};

	clazz.prototype = {
		selectObject: function (obj) {
			if (this.selected_object) {
				this.selected_object.__onPropertyChanged = null;
			}
			this.selected_object = obj;
			if (this.selected_object) {
				this.selected_object.__onPropertyChanged = objectModified.bind(this);
			}
			this.build();
		},

		build: function () {
			this.node.innerHTML = '';
			this.nodes = {};
			if (this.selected_object) {
				initProperties.call(this, this.selected_object.properties);
			}
		},
	};

	clazz.PROPERTIES_OBJECT_MODIFIED = PROPERTIES_OBJECT_MODIFIED;

	return clazz;
})();