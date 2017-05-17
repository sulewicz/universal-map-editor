'use strict'

window.me = window.me || {}

me.Metadata = (function () {
	// We will add those properties to some of the objects later on.
	var commonProperties = {
		// Name property that will be used for scripting.
		'name': {
			type: 'text'
		}
	}

	// Common methods that will be added to every object.
	var commonMethods = {
		// Method that will be used for labeling objects.
		getLabel: function () {
			return this.label + ' [' + (this.name || this.id) + ']'
		}
	}

	var metadata = {
		// This optional function allows the editor to focus proper object from the script editor.
		findObjectForToken: function (token, map_objects) {
			// If there is an object with provided token as a name, then let's focus it
			for (var i = 0, l = map_objects.length; i < l; ++i) {
				var object = map_objects[i]
				if (token == object.name) {
					return object
				}
			}
		},

		// This optional array tells the editor which tokens should be treated as objects/methods when highlighting.
		script_tokens: [
			'log'
		],

		// Here we can find the properties of available objects.
		objects: [
			// Predefined polyline object.
			me.MapShapes.Polyline({
				type: 'shape_polyline',
				label: 'Polyline',
				zOrder: -100,
                getLineWidth: function() {
                    return this.thickness
                }
			}, { // Additional properties of the polyline
                'thickness': { type: 'float', min: 0.1, default: 1 }
            }),
			// Enemy spawn point.
			{
				type: 'SPAWN_POINT',
				label: 'Spawn Point',
				// Properties of the object.
				properties: me.utils.mixin({}, commonProperties, {
					'enemyType': {
						type: 'enum',
						values: ['EASY', 'NORMAL', 'HARD'],
						default: 0
					},
					'concurentCountLimit': {
						type: 'int',
						min: 1,
						max: 255,
						default: 3
					},
					'isEnabled': {
						type: 'bool',
						default: true
					},
					'spawnDelay': {
						type: 'float',
						min: 0.1,
						default: 2
					}
				}),
				// Render method for the object.
				render: function (ctx, selected) {
					ctx.beginPath()
					ctx.arc(this.x, this.y, 10, 0, 2 * Math.PI, false)
					ctx.fillStyle = 'rgba(255, 255, 0, 0.8)'
					ctx.fill()
					ctx.strokeStyle = selected ? '#ffffff' : ctx.fillStyle
					ctx.lineWidth = 2
					ctx.stroke()
				},
				// Used for handling click events.
				contains: function (x, y) {
					return Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) < Math.pow(24, 2)
				}
			},
			// Game start point.
			{
				type: 'START_POINT',
				label: 'Start Point',
				// Render method for the object.
				render: function (ctx, selected) {
					ctx.beginPath()
					ctx.arc(this.x, this.y, 6, 0, 2 * Math.PI, false)
					ctx.fillStyle = 'rgba(0, 255, 0, 0.8)'
					ctx.fill()
					ctx.strokeStyle = selected ? '#ffffff' : ctx.fillStyle
					ctx.lineWidth = 2
					ctx.stroke()
				},
				// Used for handling click events.
				contains: function (x, y) {
					return Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) < Math.pow(12, 2)
				},
				// Custom export method.
				compile: function (output) {
					// Storing coordinates as a top level properties in the map JSON
					output.startX = this.x
					output.startY = this.y
				}
			},
			// Simple round obstacle.
			{
				type: "OBSTACLE",
				label: "Obstacle",
				properties: me.utils.mixin({}, commonProperties, {
					"radius": { type: "float", min: 1, default: 5 }
				}),
				render: function(ctx, selected) {
					ctx.beginPath()
					ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
					ctx.fillStyle = "rgba(85, 85, 85, 0.5)"
					ctx.fill()
					ctx.strokeStyle = selected ? "#ffffff" : ctx.fillStyle
        			ctx.lineWidth = 2
					ctx.stroke()
				},
				contains: function(x, y) {
					return Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) < Math.pow(this.radius, 2)
				},
				// This allows to specify how the object should be scaled
				// Additionally scalePosition is also available
                scaleSize: function(factor) {
                    this.updateStaticProperty("radius", this.properties["radius"], factor * this.radius / 100)
                }
			},
		]
	}

	// Adding common methods to every object.
	for (var i = 0; i < metadata.objects.length; ++i) {
		me.utils.mixin(metadata.objects[i], commonMethods)
	}

	return metadata
})()
