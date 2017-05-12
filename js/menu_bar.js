'use strict'

window.me = window.me || {}

{
	const electron = require('electron')
	const remote = electron.remote
	const SHOW_MAP_VIEW = 'show_map_view'
	const SHOW_EDITOR_VIEW = 'show_editor_view'

	const updateMenuItem = function (menuId, itemId, property, value) {
		electron.ipcRenderer.send('menu', 'update_property', menuId, itemId, property, value)
	}

	const updateExportButtonsVisibility = function () {
		if (this.map_path) {
			updateMenuItem('file', 'export_file', 'enabled', true)
			updateMenuItem('file', 'export_file_as', 'enabled', true)
		} else {
			updateMenuItem('file', 'export_file', 'enabled', false)
			updateMenuItem('file', 'export_file_as', 'enabled', false)
		}
	}

	const clazz = class {
		constructor (map_io, map_exporter) {
			var callbacks = {}

			this.map_io = map_io
			this.map_exporter = map_exporter

			electron.ipcRenderer.on('menu', (event, type, id) => {
				if (type === 'item_clicked') {
					if (callbacks.hasOwnProperty(id)) {
						callbacks[id](id)
					}
				}
			})

			const addClickListener = (id, callback) => {
				callbacks[id] = callback
			}

			const showSaveDialog = () => {
				remote.dialog.showSaveDialog({
						filters: [ { name: 'JSON', extensions: ['json'] }, { name: 'All files', extensions: ['*'] } ]
					}, (fileName) => {
						if (fileName) {
							this.save(fileName)
						}
				})
			}

			const showExportDialog = () => {
				remote.dialog.showSaveDialog({
						filters: [ { name: 'Exported Level', extensions: ['lvl'] }, { name: 'All files', extensions: ['*'] } ]
					}, (fileName) => {
						if (fileName) {
							this.map_io.map.export_path = fileName
							this.save(this.map_path)
							this.export(fileName)
						}
				})
			}

			const showOpenDialog = () => {
				remote.dialog.showOpenDialog({
						filters: [ { name: 'JSON', extensions: ['json'] }, { name: 'All files', extensions: ['*'] } ]
					}, (fileNames) => {
						if (fileNames) {
							this.open(fileNames[0])
						}
				})
			}

			addClickListener('save_file', () => {
				if (this.map_path) {
					this.save(this.map_path)
				} else {
					showSaveDialog()
				}
			})

			addClickListener('save_file_as', () => {
				showSaveDialog()
			})

			addClickListener('open_file', () => {
				showOpenDialog()
			})

			addClickListener('export_file', () => {
				if (this.export_path || (this.export_path = this.map_io.map.export_path)) {
					this.save(this.map_path)
					this.export(this.export_path)
				} else {
					showExportDialog()
				}
			})

			addClickListener('export_file_as', () => {
				showExportDialog()
			})

			addClickListener('map_view', () => {
				this.emitter.emit(SHOW_MAP_VIEW)
			})

			addClickListener('editor_view', () => {
				this.emitter.emit(SHOW_EDITOR_VIEW)
			})
		}
		save (path) {
			try {
				this.map_io.save(path)
				this.map_path = path
				updateExportButtonsVisibility.call(this)
			} catch (e) {
				alert('Error while saving map: ' + e)
			}
		}
		open (path) {
			try {
				this.map_io.open(path)
				this.map_path = path
				updateExportButtonsVisibility.call(this)
			} catch (e) {
				alert('Error while loading map: ' + e)
			}
		}
		export (path) {
			try {
				this.map_exporter.exportMap(path)
				this.export_path = path
			} catch (e) {
				alert('Error while exporting map: ' + e)
			}
		}
	}

	clazz.SHOW_MAP_VIEW = SHOW_MAP_VIEW
	clazz.SHOW_EDITOR_VIEW = SHOW_EDITOR_VIEW

	me.MenuBar = clazz
}
