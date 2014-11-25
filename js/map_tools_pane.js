"use strict";

window.me = window.me || {};

me.MapToolsPane = (function () {
    var addButton = function (id, callback) {
        var button = document.getElementById(id);
        button.addEventListener('click', callback);
        return button;
    };

    var GridPane = (function () {
        var clazz = function (map_pane) {
            this.node = document.getElementById('map_grid_tool_pane');
            var display_grid_checkbox = document.getElementById('map_display_grid_checkbox');
            display_grid_checkbox.checked = map_pane.isGridVisibile();
            display_grid_checkbox.addEventListener('change', function (e) {
                map_pane.setGridVisible(this.checked);
            });

            var horizontal_spacing = document.getElementById('map_grid_horizontal_spacing');
            horizontal_spacing.value = map_pane.getGridHorizontalSpacing();
            horizontal_spacing.addEventListener('change', function (e) {
                var value = this.value | 0;
                if (value < 1) {
                    this.value = value = 1;
                }
                map_pane.setGridHorizontalSpacing(value);
            });

            var vertical_spacing = document.getElementById('map_grid_vertical_spacing');
            vertical_spacing.value = map_pane.getGridVerticalSpacing();
            vertical_spacing.addEventListener('change', function (e) {
                var value = this.value | 0;
                if (value < 1) {
                    this.value = value = 1;
                }
                map_pane.setGridVerticalSpacing(value);
            });
        };
        return clazz;
    })();

    var ScalingPane = (function () {
        var clazz = function (map_pane) {
            this.node = document.getElementById('map_scaling_tool_pane');

            var scaling_factor = document.getElementById('map_scaling_factor');
            scaling_factor.addEventListener('change', function (e) {
                var value = this.value | 0;
                if (value < 1) {
                    this.value = value = 1;
                }
            });

            var map_scale_positions_btn = addButton('map_scale_positions_btn', function(e) {
                map_pane.map.scalePositions(scaling_factor.value | 0);
            });
            var map_scale_all_btn = addButton('map_scale_all_btn', function(e) {
                map_pane.map.scaleAll(scaling_factor.value | 0);
            });
            var map_scale_selected_object_btn = addButton('map_scale_selected_object_btn', function(e) {
                var object = map_pane.getSelectedObject();
                if (object) {
                    object.scaleSize(scaling_factor.value | 0);
                }
            });

        };
        return clazz;
    })();

    var clazz = function (map_pane) {
        this.map_pane = map_pane;

        var self = this;

        self.visibile_pane = null;
        self.map_tools_pane = document.getElementById('map_tools_pane');
        self.map_grid_tool_pane = new GridPane(map_pane);
        self.map_scaling_tool_pane = new ScalingPane(map_pane);

        self.grid_btn = addButton('map_grid_tool_btn', function (e) {
            self.togglePane(self.map_grid_tool_pane);
        });

        self.scaling_btn = addButton('map_scaling_tool_btn', function (e) {
            self.togglePane(self.map_scaling_tool_pane);
        });
    };

    clazz.prototype = {
        togglePane: function (pane) {
            var show = pane && pane != this.visibile_pane;
            if (this.visibile_pane) {
                this.visibile_pane.node.style.display = 'none';
                this.visibile_pane = null;
            }

            if (show) {
                this.map_tools_pane.style.display = 'block';
                this.visibile_pane = pane;
                this.visibile_pane.node.style.display = 'block';
                this.map_pane.updateMetrics();
            } else {
                this.map_tools_pane.style.display = 'none';
                this.map_pane.updateMetrics();
            }
        }
    };

    return clazz;
})();