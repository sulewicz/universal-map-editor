"use strict";

window.me = window.me || {};

me.MenuBar = (function() {
	var TOGGLE_SCRIPT_EDITOR = "toggle_script_editor";

	var updateExportButtonsVisibility = function() {
		if (this.map_path) {
			this.export_file_btn.style.display = 'inline-block'
			this.export_file_as_btn.style.display = 'inline-block'
		} else {
			this.export_file_btn.style.display = 'none'
			this.export_file_as_btn.style.display = 'none'
		}
	}

	var clazz = function(map_io, map_exporter) {
		var self = this;
		self.map_io = map_io;
		self.map_exporter = map_exporter;

		self.save_file = document.getElementById('save_file');
		self.save_file.addEventListener('change', function() {
			if (this.value) {
				self.save(this.value);
			}
		});

		self.save_file_btn = document.getElementById('save_file_btn');
		self.save_file_btn.addEventListener('click', function(e) {
			if (self.map_path) {
				self.save(self.map_path);
			} else {
				me.utils.triggerEvent(self.save_file, 'click');
			}
		});

		self.save_file_as_btn = document.getElementById('save_file_as_btn');
		self.save_file_as_btn.addEventListener('click', function(e) {
			self.save_file.value = null;
			me.utils.triggerEvent(self.save_file, 'click');
		});

		self.open_file = document.getElementById('open_file');
		self.open_file.addEventListener('change', function() {
			if (this.value) {
				self.open(this.value);
			}
		});

		self.open_file_btn = document.getElementById('open_file_btn');
		self.open_file_btn.addEventListener('click', function(e) {
			self.open_file.value = null;
			me.utils.triggerEvent(self.open_file, 'click');
		});

		self.export_file = document.getElementById('export_file');
		self.export_file.addEventListener('change', function() {
			if (this.value) {
				self.map_io.map.export_path = this.value;
				self.save(self.map_path);
				self.export(this.value);
			}
		});

		self.export_file_btn = document.getElementById('export_file_btn');
		self.export_file_btn.addEventListener('click', function(e) {
			if (self.export_path || (self.export_path = self.map_io.map.export_path)) {
				self.save(self.map_path);
				self.export(self.export_path);
			} else {
				me.utils.triggerEvent(self.export_file, 'click');
			}
		});

		self.export_file_as_btn = document.getElementById('export_file_as_btn');
		self.export_file_as_btn.addEventListener('click', function(e) {
			self.export_file.value = null;
			me.utils.triggerEvent(self.export_file, 'click');
		});

		self.toogle_script_editor_btn = document.getElementById('map_script_toggle_btn');
		self.toogle_script_editor_btn.addEventListener('click', function(e) {
			self.emitter.emit(TOGGLE_SCRIPT_EDITOR);
		});
	};

	clazz.prototype = {
		save: function(path) {
			try {
				this.map_io.save(path);
				this.map_path = path;
				updateExportButtonsVisibility.call(this);
			} catch (e) {
				alert('Error while saving map: ' + e);
			}
		},

		open: function(path) {
			try {
				this.map_io.open(path);
				this.map_path = path;
				updateExportButtonsVisibility.call(this);
			} catch (e) {
				alert('Error while loading map: ' + e);
			}
		},

		export: function(path) {
			try {
				this.map_exporter.exportMap(path);
				this.export_path = path;
			} catch (e) {
				alert('Error while exporting map: ' + e);
			}
		}
	};

	clazz.TOGGLE_SCRIPT_EDITOR = TOGGLE_SCRIPT_EDITOR;

	return clazz;
})();
