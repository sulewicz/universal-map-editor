"use strict";

window.me = window.me || {};

const electron = require('electron');
const remote = electron.remote;

me.MenuBar = (function () {
	var SHOW_MAP_VIEW = "show_map_view";
	var SHOW_EDITOR_VIEW = "show_editor_view";

	function updateMenuItem (menuId, itemId, property, value) {
		electron.ipcRenderer.send('menu', 'update_property', menuId, itemId, property, value);
	}

	function updateExportButtonsVisibility () {
		if (this.map_path) {
			updateMenuItem('file', 'export_file', 'enabled', true);
			updateMenuItem('file', 'export_file_as', 'enabled', true);
		} else {
			updateMenuItem('file', 'export_file', 'enabled', false);
			updateMenuItem('file', 'export_file_as', 'enabled', false);
		}
	}

	var clazz = function (map_io, map_exporter) {
		var self = this;
		var callbacks = {};

		self.map_io = map_io;
		self.map_exporter = map_exporter;

		electron.ipcRenderer.on('menu', (event, type, id) => {
			if (type === 'item_clicked') {
				if (callbacks.hasOwnProperty(id)) {
					callbacks[id](id);
				}
			}
		});

		function addClickListener (id, callback) {
			callbacks[id] = callback;
		}

		function showSaveDialog () {
			remote.dialog.showSaveDialog({
					filters: [ { name: 'JSON', extensions: ['json'] } ]
				}, function(fileName) {
					if (fileName) {
						self.save(fileName);
					}
			});
		}

		function showExportDialog () {
			remote.dialog.showSaveDialog({
					filters: [ { name: 'Exported Level', extensions: ['lvl'] } ]
				}, function(fileName) {
					if (fileName) {
						self.map_io.map.export_path = fileName;
						self.save(self.map_path);
						self.export(fileName);
					}
			});
		}

		function showOpenDialog () {
			remote.dialog.showOpenDialog({
					filters: [ { name: 'JSON', extensions: ['json'] } ]
				}, function(fileNames) {
					if (fileNames) {
						self.open(fileNames[0]);
					}
			});
		}

		self.save_file_btn = addClickListener('save_file', function () {
			if (self.map_path) {
				self.save(self.map_path);
			} else {
				showSaveDialog();
			}
		});

		self.save_file_as_btn = addClickListener('save_file_as', function () {
			showSaveDialog();
		});

		self.open_file_btn = addClickListener('open_file', function () {
			showOpenDialog();
		});

		self.export_file_btn = addClickListener('export_file', function () {
			if (self.export_path || (self.export_path = self.map_io.map.export_path)) {
				self.save(self.map_path);
				self.export(self.export_path);
			} else {
				showExportDialog();
			}
		});

		self.export_file_as_btn = addClickListener('export_file_as', function () {
			showExportDialog();
		});

		function switchMapScriptCallback(id) {
			if (toggledItem !== id) {
				self.emitter.emit(SHOW_MAP_VIEW);
				updateMenuItem('view', toggledItem, 'checked', false);
				updateMenuItem('view', id, 'checked', true);
				toggledItem = id;
			}
		}

		self.toogle_script_editor_btn = addClickListener('map_view', function () {
			self.emitter.emit(SHOW_MAP_VIEW);
		});

		self.toogle_script_editor_btn = addClickListener('editor_view', function () {
			self.emitter.emit(SHOW_EDITOR_VIEW);
		});
	};

	clazz.prototype = {
		save: function (path) {
			try {
				this.map_io.save(path);
				this.map_path = path;
				updateExportButtonsVisibility.call(this);
			} catch (e) {
				alert('Error while saving map: ' + e);
			}
		},

		open: function (path) {
			try {
				this.map_io.open(path);
				this.map_path = path;
				updateExportButtonsVisibility.call(this);
			} catch (e) {
				alert('Error while loading map: ' + e);
			}
		},

		export: function (path) {
			try {
				this.map_exporter.exportMap(path);
				this.export_path = path;
			} catch (e) {
				alert('Error while exporting map: ' + e);
			}
		}
	};

	clazz.SHOW_MAP_VIEW = SHOW_MAP_VIEW;
	clazz.SHOW_EDITOR_VIEW = SHOW_EDITOR_VIEW;

	return clazz;
})();
