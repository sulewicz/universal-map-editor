'use strict'

window.me = window.me || {}

{
	const MAP_OBJECTS_MODIFIED = 'mapObjectsModified'

	const addButton = function (id, callback) {
		var button = document.getElementById(id)
		button.addEventListener('click', callback)
		return button
	}

	const GridPane = class {
		constructor (mapPane) {
			this.node = document.getElementById('map_grid_tool_pane')
			var displayGridCheckbox = document.getElementById('map_display_grid_checkbox')
			displayGridCheckbox.checked = mapPane.isGridVisibile()
			displayGridCheckbox.addEventListener('change', function (e) {
				mapPane.setGridVisible(this.checked)
				mapPane.invalidate()
			})
			var horizontalSpacing = document.getElementById('map_grid_horizontal_spacing')
			horizontalSpacing.value = mapPane.getGridHorizontalSpacing()
			horizontalSpacing.addEventListener('change', function (e) {
				var value = this.value | 0
				if (value < 1) {
					this.value = value = 1
				}
				mapPane.setGridHorizontalSpacing(value)
				mapPane.invalidate()
			})

			var verticalSpacing = document.getElementById('map_grid_vertical_spacing')
			verticalSpacing.value = mapPane.getGridVerticalSpacing()
			verticalSpacing.addEventListener('change', function (e) {
				var value = this.value | 0
				if (value < 1) {
					this.value = value = 1
				}
				mapPane.setGridVerticalSpacing(value)
				mapPane.invalidate()
			})
		}
	}

	const ScalingPane = class {
		constructor (mapPane, toolsPane) {
			this.node = document.getElementById('map_scaling_tool_pane')

			var scalingFactor = document.getElementById('map_scaling_factor')
			scalingFactor.addEventListener('change', function (e) {
				var value = this.value | 0
				if (value < 1) {
					this.value = value = 1
				}
			})

			var emitEvent = function () {
				toolsPane.emitter.emit(MAP_OBJECTS_MODIFIED)
			}

			var mapScalePositionsBtn = addButton('map_scale_positions_btn', function (e) {
				mapPane.map.scalePositions(scalingFactor.value | 0)
				emitEvent()
			})
			var mapScaleAllBtn = addButton('map_scale_all_btn', function (e) {
				mapPane.map.scaleAll(scalingFactor.value | 0)
				emitEvent()
			})
			var mapScaleSelectedObjectBtn = addButton('map_scale_selected_object_btn', function (e) {
				var object = mapPane.selectedObject
				if (object) {
					object.scaleSize(scalingFactor.value | 0)
				}
				emitEvent()
			})

		}
	}

	const FilteringPane = class {
		constructor (mapPane, objectListBox) {
			this.node = document.getElementById('map_filtering_tool_pane')
			var filterObjectsCheckbox = document.getElementById('map_filter_objects_checkbox')
			filterObjectsCheckbox.checked = objectListBox.isFilteringByType() || mapPane.isFilteringByType()
			filterObjectsCheckbox.addEventListener('change', function (e) {
				objectListBox.setFilteringByType(this.checked)
				mapPane.setFilteringByType(this.checked)
				mapPane.invalidate()
			})
		}
	}

	const clazz = class {
		constructor (mapPane, objectListBox) {
			this.mapPane = mapPane
			this.objectListBox = objectListBox

			this.visibilePane = null
			this.mapToolsPane = document.getElementById('map_tools_pane')
			this.mapGridToolPane = new GridPane(mapPane, this)
			this.mapScalingToolPane = new ScalingPane(mapPane, this)
			this.mapFilteringToolPane = new FilteringPane(mapPane, objectListBox)

			this.gridBtn = addButton('map_grid_tool_btn', (e) => {
				this.togglePane(this.mapGridToolPane)
			})

			this.scalingBtn = addButton('map_scaling_tool_btn', (e) => {
				this.togglePane(this.mapScalingToolPane)
			})

			this.filteringBtn = addButton('map_filtering_tool_btn', (e) => {
				this.togglePane(this.mapFilteringToolPane)
			})
		}
		togglePane (pane) {
			var show = pane && pane != this.visibilePane
			if (this.visibilePane) {
				this.visibilePane.node.style.display = 'none'
				this.visibilePane = null
			}

			if (show) {
				this.mapToolsPane.style.display = 'block'
				this.visibilePane = pane
				this.visibilePane.node.style.display = 'block'
				this.mapPane.updateMetrics()
			} else {
				this.mapToolsPane.style.display = 'none'
				this.mapPane.updateMetrics()
			}
		}
	}

	clazz.MAP_OBJECTS_MODIFIED = MAP_OBJECTS_MODIFIED

	me.MapToolsPane = clazz
}
