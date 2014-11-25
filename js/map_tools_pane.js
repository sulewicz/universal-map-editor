"use strict";

window.me = window.me || {};

me.MapToolsPane = (function () {
    var GridPane = (function() {
        var clazz = function(map_pane) {
            this.node = document.getElementById('map_grid_tool_pane');
            var display_grid_checkbox = document.getElementById('map_display_grid_checkbox');
            display_grid_checkbox.checked = map_pane.isGridVisibile();
            display_grid_checkbox.addEventListener('change', function(e) {
                map_pane.setGridVisible(this.checked);
            });
            
            var horizontal_spacing = document.getElementById('map_grid_horizontal_spacing');
            horizontal_spacing.value = map_pane.getGridHorizontalSpacing();
            horizontal_spacing.addEventListener('change', function(e) {
                var value = this.value | 0;
                if (value < 1) {
                    this.value = value = 1;
                }
                map_pane.setGridHorizontalSpacing(value);
            });
            
            var vertical_spacing = document.getElementById('map_grid_vertical_spacing');
            vertical_spacing.value = map_pane.getGridVerticalSpacing();
            vertical_spacing.addEventListener('change', function(e) {
                var value = this.value | 0;
                if (value < 1) {
                    this.value = value = 1;
                }
                map_pane.setGridVerticalSpacing(value);
            });
        }
        return clazz;
    })();

    var clazz = function(map_pane) {
        this.map_pane = map_pane;

        var self = this;

        self.visibile_pane = null;
        self.map_tools_pane = document.getElementById('map_tools_pane');
        self.map_grid_tool_pane = new GridPane(map_pane);

        var addButton = function (id, callback) {
            var button = document.getElementById(id);
            button.addEventListener('click', callback);
            return button;
        };

        self.grid_btn = addButton('map_grid_tool_btn', function (e) {
            self.togglePane(self.map_grid_tool_pane);
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
            } else {
                this.map_tools_pane.style.display = 'none';
            }
        }
    };

    return clazz;
})();