"use strict";

window.me = window.me || {};

me.ZoomToolkit = (function () {
	var CLICK_STEP = 20;
	var SCROLL_STEP = 10;
	var MIN_ZOOM = 20;
	var MAX_ZOOM = 800;

	var clazz = function (mapPane) {
		var toolkit = this;
		var zoomFactorLabel = document.getElementById('zoom_factor');
		var zoomOutBtn = document.getElementById('zoom_out_btn');
		var zoomInBtn = document.getElementById('zoom_in_btn');

		var updateLabel = function () {
			zoomFactorLabel.innerText = toolkit.scale + '%';
		}

		var setZoom = function (zoom) {
			if (zoom < MIN_ZOOM) {
				zoom = MIN_ZOOM;
			} else if (zoom > MAX_ZOOM) {
				zoom = MAX_ZOOM;
			}
			zoomFactorLabel.innerText = zoom + '%';
			toolkit.scale = zoom;
			mapPane.invalidate();
		}

		zoomOutBtn.addEventListener('click', function () {
			setZoom(toolkit.scale - CLICK_STEP);
		});

		zoomInBtn.addEventListener('click', function () {
			setZoom(toolkit.scale + CLICK_STEP);
		});

		mapPane.node.addEventListener('mousewheel', function (e) {
			setZoom(toolkit.scale + (e.wheelDelta >= 0 ? SCROLL_STEP : -SCROLL_STEP));
		});

		setZoom(100);
	}

	return clazz;
})();

me.MapPane = (function () {
	var MAP_MOUSE_MOVED = "map_mouse_moved";
	var MAP_MOUSE_CLICKED = "map_mouse_clicked";
	var MAP_MOUSE_DRAGGED = "map_mouse_dragged";

	var FPS = 20;
	var REFRESH_DELAY = 1000 / FPS;

	var clazz = function (map) {
		this.map = map;
		var node = document.getElementById('map_canvas');
		node.height = node.parentNode.offsetHeight;
		node.width = node.parentNode.offsetWidth;
		this.display_grid = true;
		this.horizontal_spacing = 30;
		this.vertical_spacing = 30;
		this.viewport_x = 0;
		this.viewport_y = 0;
		this.display_width = node.width;
		this.display_height = node.height;
		this.rendering = false;
		this.redraw = true;
		this.node = node;

		this.zoomToolkit = new me.ZoomToolkit(this);

		this.__render = this.render.bind(this, this.node.getContext("2d"));
		this.initMouseHandlers();
		window.addEventListener('resize', function () {
			this.updateMetrics();
		}.bind(this), false);
	};

	clazz.prototype = {
		initMouseHandlers: function () {
			var domToMapPosition = function (x, y) {
				var scale = this.getScale();
				var viewport = this.getViewportInMapUnits();
				var offset = this.getViewportOffsetInPixels();
				return {
					x: viewport.x + (x + offset.x) / scale,
					y: viewport.y + (y + offset.y) / scale
				};
			}.bind(this);

			var node = this.node;
			var mouseDown = null;
			var dragging = false;
			node.addEventListener('mousedown', function (event) {
				mouseDown = {
					map: domToMapPosition(event.layerX, event.layerY),
					layer: {
						x: event.layerX,
						y: event.layerY
					}
				}
			}.bind(this));

			node.addEventListener('mouseup', function (event) {
				if (mouseDown && !dragging) { // No drag occurred.
					this.emitter.emit(MAP_MOUSE_CLICKED, mouseDown.map, event);
				}
				mouseDown = null;
				dragging = false;
			}.bind(this));

			node.addEventListener('mousemove', function (event) {
				var pos = domToMapPosition(event.layerX, event.layerY);
				this.emitter.emit(MAP_MOUSE_MOVED, pos, event);
				if (mouseDown) {
					dragging = true;
					var scale = this.getScale();
					var delta = {
						x: (event.layerX - mouseDown.layer.x) / scale,
						y: (event.layerY - mouseDown.layer.y) / scale
					};
					this.emitter.emit(MAP_MOUSE_DRAGGED, mouseDown.map, delta, event);
				}
			}.bind(this));

			node.addEventListener('mouseout', function (event) {
				mouseDown = null;
				dragging = false;
			}.bind(this));
		},

		getScale: function () {
			return this.zoomToolkit.scale / 100;
		},

		render: function (ctx) {
			if (this.redraw) {
				var w = this.display_width,
					h = this.display_height;
				ctx.save();
				// Clearing canvas
				ctx.lineWidth = 1;
				ctx.fillStyle = "#aaaaaa";
				ctx.strokeStyle = "#000000";

				var scale = this.getScale();
				var viewport = this.getViewportInPixels();
				var offset = this.getViewportOffsetInPixels();
				viewport.x = viewport.x + offset.x;
				viewport.y = viewport.y + offset.y;

				// Viewport position
				ctx.translate(-viewport.x, -viewport.y);
				ctx.fillRect(viewport.x, viewport.y, w, h);

				// Drawing horizontal guideline
				ctx.beginPath();
				ctx.moveTo(viewport.x, 0);
				ctx.lineTo(viewport.x + w, 0);
				ctx.stroke();

				// Drawing vertical guideline
				ctx.beginPath();
				ctx.moveTo(0, viewport.y);
				ctx.lineTo(0, viewport.y + h);
				ctx.stroke();

				ctx.scale(scale, scale);

				// Drawing grid
				if (this.display_grid) {
					ctx.lineWidth = 1.0 / scale;
					ctx.strokeStyle = "#686868";

					var spacing = this.horizontal_spacing;
					var start = Math.round((viewport.x / scale) / spacing) * spacing;
					var end = (viewport.x + w) / scale;
					for (var gx = start; gx <= end; gx += spacing) {
						if (Math.round(gx) != 0) {
							ctx.beginPath();
							ctx.moveTo(gx, viewport.y / scale);
							ctx.lineTo(gx, (viewport.y + h) / scale);
							ctx.stroke();
						}
					}

					spacing = this.vertical_spacing;
					start = Math.round((viewport.y / scale) / spacing) * spacing;
					end = (viewport.y + h) / scale;
					for (var gy = start; gy <= end; gy += spacing) {
						if (Math.round(gy) != 0) {
							ctx.beginPath();
							ctx.moveTo(viewport.x / scale, gy);
							ctx.lineTo((viewport.x + w) / scale, gy);
							ctx.stroke();
						}
					}
				}

				var objects = this.map.objects;
				for (var idx = 0; idx < objects.length; ++idx) {
					var object = objects[idx];
					object.render(ctx, this.selected_object == object, scale);
				}

				ctx.restore();
				this.redraw = false;
			}
			if (this.rendering) {
				setTimeout(this.__render, REFRESH_DELAY);
			}
		},

		setViewportInMapUnits: function (x, y) {
			this.viewport_x = x;
			this.viewport_y = y;
		},

		getViewportInMapUnits: function () {
			return {
				x: this.viewport_x,
				y: this.viewport_y
			};
		},

		getViewportOffsetInMapUnits: function () {
			var scale = this.getScale();
			var offset = this.getViewportOffsetInPixels();
			return {
				x: offset.x / scale,
				y: offset.y / scale
			}
		},

		getViewportInPixels: function () {
			var scale = this.getScale();
			return {
				x: this.viewport_x * scale,
				y: this.viewport_y * scale
			};
		},

		getViewportOffsetInPixels: function () {
			return {
				x: -this.display_width / 2,
				y: -this.display_height / 2
			}
		},

		isInViewportInMapUnits: function (x, y) {
			var viewport = this.getViewportInMapUnits();
			var offset = this.getViewportOffsetInMapUnits();
			return Math.abs(x - viewport.x) < -offset.x && Math.abs(y - viewport.y) < -offset.y;
		},

		startRendering: function () {
			this.rendering = true;
			window.requestAnimationFrame(this.__render);
		},

		stopRendering: function () {
			this.rendering = false;
		},

		selectObject: function (obj) {
			this.selected_object = obj;
			if (obj && obj.hasOwnProperty('x') && obj.hasOwnProperty('y')) {
				if (!this.isInViewportInMapUnits(obj.x, obj.y)) {
					this.setViewportInMapUnits(obj.x, obj.y)
				}
			}
		},

		getSelectedObject: function () {
			return this.selected_object;
		},

		setGridVisible: function (visible) {
			this.display_grid = visible;
		},

		isGridVisibile: function () {
			return this.display_grid;
		},

		setGridHorizontalSpacing: function (spacing) {
			this.horizontal_spacing = spacing;
		},

		getGridHorizontalSpacing: function () {
			return this.horizontal_spacing;
		},

		setGridVerticalSpacing: function (spacing) {
			this.vertical_spacing = spacing;
		},

		getGridVerticalSpacing: function () {
			return this.vertical_spacing;
		},

		updateMetrics: function () {
			var node = this.node;
			node.height = node.parentNode.offsetHeight;
			node.width = node.parentNode.offsetWidth;
			this.display_width = node.width;
			this.display_height = node.height;
			this.invalidate();
		},

		invalidate: function () {
			this.redraw = true;
		}
	};

	clazz.MAP_MOUSE_MOVED = MAP_MOUSE_MOVED;
	clazz.MAP_MOUSE_CLICKED = MAP_MOUSE_CLICKED;
	clazz.MAP_MOUSE_DRAGGED = MAP_MOUSE_DRAGGED;

	return clazz;
})();