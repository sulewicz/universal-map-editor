"use strict";

window.me = window.me || {};

var fs = require('fs');

me.Editor = (function() {
	var clazz = function() {
		this.map = new me.Map();
		this.map_objects = new me.MapObjects();
		this.map_view = new me.MapView(this.map);
		this.tool_box = new me.ToolBox();
		this.object_list_box = new me.ObjectListBox(this.map);
		this.properties_box = new me.PropertiesBox();
		this.status_bar = new me.StatusBar();
		this.map_io = new me.MapIo(this.map, this.map_objects);
		this.map_exporter = new me.MapExporter(this.map);
		this.menu_bar = new me.MenuBar(this.map_io, this.map_exporter);
		this.script_editor = new me.ScriptEditor(this.map);

		this.init();
	};

	clazz.prototype = {
		init: function() {
			this.map_objects.createClasses(me.Metadata.objects);
			this.initToolbox();

			this.map_view.startRendering();
		},

		initToolbox: function() {
			var objects = this.map_objects.getAvailableTypes();
			for (var i = 0; i < objects.length; ++i) {
				var object = objects[i];
				this.tool_box.addItem(object.label, object.type);
			}
		}
	};

	return clazz;
})();
