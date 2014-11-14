window.me = window.me || {};

me.MapShapes = (function() {
	return {
		Polyline: function(spec) {
			var NODE_SIZE = 5;
			var ret = {
				properties: { "close": { type: "bool", default: false }},
				init: function(x, y) {
					this.mouse_position = null;
					this.points = [{x: x, y: y}];
				}, 

				findNode: function(x, y) {
                    var nodeSize = this.getNodeSize();
					for (var i = 0; i < this.points.length; ++i) {
						var point = this.points[i];
						if (x >= point.x - nodeSize && x <= point.x + nodeSize && y >= point.y - nodeSize * 2 && y <= point.y + nodeSize * 2) {
							return i;
						}
					}
					return -1;
				},
                
                getNodeSize: function() {
                    return NODE_SIZE / this.scale;
                },  

				render: function(ctx, selected, scale) {
                    this.scale = scale;
					if (this.points.length > 0) {
                        var nodeSize = this.getNodeSize();
                        var lineColor = selected ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.5)';
                        var previewLineColor = 'rgba(255,255,255,0.5)';
                        var nodeStrokeColor = selected ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.5)';
                        var nodeFillColor = selected ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.5)';
                        var polyLineWidth = 1;
                        var strokeWidth = 1 / scale;
                        
						ctx.strokeStyle = lineColor;
                        ctx.lineWidth = polyLineWidth;
						ctx.beginPath();
						var point = this.points[0];
						ctx.moveTo(point.x, point.y);
						for (var i = 1; i < this.points.length; ++i) {
							point = this.points[i];
							ctx.lineTo(point.x, point.y);
						}

						ctx.stroke();

						if (this.mouse_position) {
                            ctx.lineWidth = strokeWidth;
							ctx.strokeStyle = nodeStrokeColor;
                            ctx.fillStyle = nodeFillColor;
							var lastPoint = this.points[this.points.length - 1];
							point = this.mouse_position;
							ctx.fillRect(point.x - nodeSize, point.y - nodeSize, nodeSize * 2, nodeSize * 2);
                            ctx.strokeRect(point.x - nodeSize, point.y - nodeSize, nodeSize * 2, nodeSize * 2);
                            ctx.strokeStyle = previewLineColor;
                            ctx.lineWidth = polyLineWidth;
							ctx.beginPath();
							ctx.moveTo(lastPoint.x, lastPoint.y);
							ctx.lineTo(point.x, point.y);
							ctx.stroke();
						}

						if (this.close && this.points.length >= 3) {
							ctx.strokeStyle = this.mouse_position ? previewLineColor : lineColor;
                            ctx.lineWidth = polyLineWidth;
							var lastPoint = this.mouse_position || this.points[this.points.length - 1];
							point = this.points[0];
							ctx.beginPath();
							ctx.moveTo(point.x, point.y);
							ctx.lineTo(lastPoint.x, lastPoint.y);
							ctx.stroke();	
						}

                        ctx.strokeStyle = nodeStrokeColor;
						ctx.fillStyle = nodeFillColor;
                        ctx.lineWidth = strokeWidth;
						for (var i = 0; i < this.points.length; ++i) {
							point = this.points[i];
							ctx.fillRect(point.x - nodeSize, point.y - nodeSize, nodeSize * 2, nodeSize * 2);
                            ctx.strokeRect(point.x - nodeSize, point.y - nodeSize, nodeSize * 2, nodeSize * 2);
						}
					}
				},

				contains: function(x, y) {
					var i = this.findNode(x, y);
					return i >= 0;
				},

				onMouseClick: function(pos) {
					this.points.push(pos);
					return true;
				},

				onMouseMove: function(pos) {
					this.mouse_position = pos;
				},

				onMouseDrag: function(startPos, delta) {
					if (!startPos.hasOwnProperty('node')) {
						var node = this.points[this.findNode(startPos.x, startPos.y)];
						startPos.node = node;
						startPos.origin = { x: node.x, y: node.y };
					}
					startPos.node.x = startPos.origin.x + delta.x;
					startPos.node.y = startPos.origin.y + delta.y;
				},

				onUnselected: function() {
					this.mouse_position = null;
				},

				onDelete: function() {
					if (this.points.length == 1) {
						return false;
					} else {
						this.points.length = this.points.length - 1;
						return true;
					}
				},

				pack: function() {
					return {
						id: this.id,
						points: this.points,
						close: this.close
					};
				},

				unpack: function(data) {
					var props = ['id', 'points', 'close'];
					for (var i = 0; i < props.length; ++i) {
						if (data.hasOwnProperty(props[i])) {
							this[props[i]] = data[props[i]];
						}
					}
				},

				compile: function(output) {
					output.polylines = output.polylines || [];
					output.polylines.push({ points: this.points, close: this.close });
				}
			};
			return me.utils.mixin(ret, spec || {});
		}
	};
})();