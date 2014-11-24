"use strict";

window.me = window.me || {};

me.MapToolsPane = (function () {

    var clazz = function (map_pane) {
        this.map_pane = map_pane;

        var self = this;

        self.visibile_pane = null;
        self.map_tools_pane = document.getElementById('map_tools_pane');
        self.map_grid_tool_pane = document.getElementById('map_grid_tool_pane');

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
                this.visibile_pane.style.display = 'none';
                this.visibile_pane = null;
            }
            
            if (show) {
                this.map_tools_pane.style.display = 'block';
                this.visibile_pane = pane;
                this.visibile_pane.style.display = 'block';
            } else {
                this.map_tools_pane.style.display = 'none';
            }
        }
    };

    return clazz;
})();