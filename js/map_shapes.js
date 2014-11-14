window.me = window.me || {};

me.MapShapes = (function() {
	return {
		Polyline: function(spec, properties) {
			var NODE_SIZE = 5;
			var ret = {
				properties: me.utils.mixin({ "close": { type: "bool", default: false }}, properties || {}),
				init: function(x, y) {
					this.mouse_position = null;
					this.points = [{x: x, y: y}];
                    this.selected_point = 0;
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
                
                getLineWidth: function() {
                    return 1;
                },

				render: function(ctx, selected, scale) {
                    this.scale = scale;
					if (this.points.length > 0) {
                        var nodeSize = this.getNodeSize();
                        var lineColor = selected ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.5)';
                        var previewLineColor = 'rgba(255,255,255,0.5)';
                        var nodeStrokeColor = selected ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.5)';
                        var selectedNodeStrokeColor = selected ? 'rgba(255,0,0,1)' : nodeStrokeColor;
                        var nodeFillColor = selected ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.5)';
                        var polyLineWidth = this.getLineWidth();
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
							var currentPoint = this.points[this.selected_point];
                            var mousePoint = this.mouse_position;
                            var nextPoint = this.points[this.selected_point + 1];
                            if (!nextPoint && this.close && this.points.length >= 2) {
                                nextPoint = this.points[0];
                            }

                            ctx.strokeStyle = previewLineColor;
                            ctx.lineWidth = polyLineWidth;
							ctx.beginPath();
							ctx.moveTo(currentPoint.x, currentPoint.y);
							ctx.lineTo(mousePoint.x, mousePoint.y);
                            if (nextPoint) {
                                ctx.lineTo(nextPoint.x, nextPoint.y);
                            }
							ctx.stroke();
                            
                            ctx.lineWidth = strokeWidth;
							ctx.strokeStyle = nodeStrokeColor;
                            ctx.fillStyle = nodeFillColor;
                            ctx.fillRect(mousePoint.x - nodeSize, mousePoint.y - nodeSize, nodeSize * 2, nodeSize * 2);
                            ctx.strokeRect(mousePoint.x - nodeSize, mousePoint.y - nodeSize, nodeSize * 2, nodeSize * 2);
						}

						if (this.close && this.points.length >= 3) {
                            ctx.lineWidth = polyLineWidth;
							ctx.strokeStyle = lineColor;
							var lastPoint = this.points[this.points.length - 1];
							var firstPoint = this.points[0];
							ctx.beginPath();
							ctx.moveTo(firstPoint.x, firstPoint.y);
							ctx.lineTo(lastPoint.x, lastPoint.y);
							ctx.stroke();	
						}

						ctx.fillStyle = nodeFillColor;
                        ctx.lineWidth = strokeWidth;
						for (var i = 0; i < this.points.length; ++i) {
							point = this.points[i];
                            ctx.strokeStyle = (i === this.selected_point) ? selectedNodeStrokeColor : nodeStrokeColor;
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
                    var i = this.findNode(pos.x, pos.y);
                    if (i >= 0) {
                        this.selected_point = i;
                    } else {
                        this.points.splice(this.selected_point + 1, 0, pos);
                        this.selected_point = this.selected_point + 1;
                    }
				    return true;
				},

				onMouseMove: function(pos) {
					this.mouse_position = pos;
				},

				onMouseDrag: function(startPos, delta) {
					if (!startPos.hasOwnProperty('node')) {
                        var i = this.findNode(startPos.x, startPos.y);
						var node = this.points[i];
                        this.selected_point = i;
						startPos.node = node;
						startPos.origin = { x: node.x, y: node.y };
					}
					startPos.node.x = startPos.origin.x + delta.x;
					startPos.node.y = startPos.origin.y + delta.y;
				},
                
                onSelected: function(x, y) {
                    var i = this.findNode(x, y);
                    this.selected_point = i >= 0 ? i : this.points.length - 1;
                },

				onUnselected: function() {
					this.mouse_position = null;
				},

				onDelete: function() {
					if (this.points.length == 1) {
						return false;
					} else {
                        this.points.splice(this.selected_point, 1);
						this.selected_point = this.selected_point - 1;
						return true;
					}
				},

				pack: function() {
					var ret = {
						id: this.id,
						points: this.points
					};
                    for (var prop in this.properties) {
                        ret[prop] = this[prop];
                    }
                    return ret;
				},

				unpack: function(data) {
					var props = ['id', 'points'];
                    for (var prop in this.properties) {
                        props.push(prop);
                    }
					for (var i = 0; i < props.length; ++i) {
						if (data.hasOwnProperty(props[i])) {
							this[props[i]] = data[props[i]];
						}
					}
				},

				compile: function(output) {
					output.polylines = output.polylines || [];
                    var ret = { points: this.points };
                    for (var prop in this.properties) {
                        ret[prop] = this[prop];
                    }
					output.polylines.push(ret);
				}
			};
			return me.utils.mixin(ret, spec || {});
		}
	};
})();