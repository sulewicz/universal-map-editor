'use strict'

window.me = window.me || {}

{
	const MAP_OBJECTS_MODIFIED = 'map_objects_modified'

	const addButton = function (id, callback) {
		var button = document.getElementById(id)
		button.addEventListener('click', callback)
		return button
	}

	const GridPane = class {
		constructor (map_pane) {
			this.node = document.getElementById('map_grid_tool_pane')
			var display_grid_checkbox = document.getElementById('map_display_grid_checkbox')
			display_grid_checkbox.checked = map_pane.isGridVisibile()
			display_grid_checkbox.addEventListener('change', function (e) {
				map_pane.setGridVisible(this.checked)
				map_pane.invalidate()
			})
			var horizontal_spacing = document.getElementById('map_grid_horizontal_spacing')
			horizontal_spacing.value = map_pane.getGridHorizontalSpacing()
			horizontal_spacing.addEventListener('change', function (e) {
				var value = this.value | 0
				if (value < 1) {
					this.value = value = 1
				}
				map_pane.setGridHorizontalSpacing(value)
				map_pane.invalidate()
			})

			var vertical_spacing = document.getElementById('map_grid_vertical_spacing')
			vertical_spacing.value = map_pane.getGridVerticalSpacing()
			vertical_spacing.addEventListener('change', function (e) {
				var value = this.value | 0
				if (value < 1) {
					this.value = value = 1
				}
				map_pane.setGridVerticalSpacing(value)
				map_pane.invalidate()
			})
		}
	}

	const ScalingPane = class {
		constructor (map_pane, tools_pane) {
			this.node = document.getElementById('map_scaling_tool_pane')

			var scaling_factor = document.getElementById('map_scaling_factor')
			scaling_factor.addEventListener('change', function (e) {
				var value = this.value | 0
				if (value < 1) {
					this.value = value = 1
				}
			})

			var emitEvent = function () {
				tools_pane.emitter.emit(MAP_OBJECTS_MODIFIED)
			}

			var map_scale_positions_btn = addButton('map_scale_positions_btn', function (e) {
				map_pane.map.scalePositions(scaling_factor.value | 0)
				emitEvent()
			})
			var map_scale_all_btn = addButton('map_scale_all_btn', function (e) {
				map_pane.map.scaleAll(scaling_factor.value | 0)
				emitEvent()
			})
			var map_scale_selected_object_btn = addButton('map_scale_selected_object_btn', function (e) {
				var object = map_pane.selectedObject
				if (object) {
					object.scaleSize(scaling_factor.value | 0)
				}
				emitEvent()
			})

		}
	}

	const FilteringPane = class {
		constructor (map_pane, object_list_box) {
			this.node = document.getElementById('map_filtering_tool_pane')
			var filter_objects_checkbox = document.getElementById('map_filter_objects_checkbox')
			filter_objects_checkbox.checked = object_list_box.isFilteringByType() || map_pane.isFilteringByType()
			filter_objects_checkbox.addEventListener('change', function (e) {
				object_list_box.setFilteringByType(this.checked)
				map_pane.setFilteringByType(this.checked)
				map_pane.invalidate()
			})
		}
	}

	const clazz = class {
		constructor (map_pane, object_list_box) {
			this.map_pane = map_pane
			this.object_list_box = object_list_box

			this.visibile_pane = null
			this.map_tools_pane = document.getElementById('map_tools_pane')
			this.map_grid_tool_pane = new GridPane(map_pane, this)
			this.map_scaling_tool_pane = new ScalingPane(map_pane, this)
			this.map_filtering_tool_pane = new FilteringPane(map_pane, object_list_box)

			this.grid_btn = addButton('map_grid_tool_btn', (e) => {
				this.togglePane(this.map_grid_tool_pane)
			})

			this.scaling_btn = addButton('map_scaling_tool_btn', (e) => {
				this.togglePane(this.map_scaling_tool_pane)
			})

			this.filtering_btn = addButton('map_filtering_tool_btn', (e) => {
				this.togglePane(this.map_filtering_tool_pane)
			})
		}
		togglePane (pane) {
			var show = pane && pane != this.visibile_pane
			if (this.visibile_pane) {
				this.visibile_pane.node.style.display = 'none'
				this.visibile_pane = null
			}

			if (show) {
				this.map_tools_pane.style.display = 'block'
				this.visibile_pane = pane
				this.visibile_pane.node.style.display = 'block'
				this.map_pane.updateMetrics()
			} else {
				this.map_tools_pane.style.display = 'none'
				this.map_pane.updateMetrics()
			}
		}
	}

	clazz.MAP_OBJECTS_MODIFIED = MAP_OBJECTS_MODIFIED

	me.MapToolsPane = clazz
}
