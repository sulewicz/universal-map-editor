'use strict'

window.me = window.me || {}

{
  const CLICK_STEP = 20
  const SCROLL_STEP = 25
  const MIN_ZOOM = 20
  const MAX_ZOOM = 1600

  const clazz = class {
    constructor (mapPane) {
      this.mapPane = mapPane
      this.zoomFactorLabel = document.getElementById('zoom_factor')
      var zoomOutBtn = document.getElementById('zoom_out_btn')
      var zoomInBtn = document.getElementById('zoom_in_btn')

      zoomOutBtn.addEventListener('click', () => {
        this.zoom = this.scale - CLICK_STEP
      })

      zoomInBtn.addEventListener('click', () => {
        this.zoom = this.scale + CLICK_STEP
      })

      mapPane.node.addEventListener('mousewheel', (e) => {
        this.zoom = this.scale + (e.wheelDelta >= 0 ? SCROLL_STEP : -SCROLL_STEP)
      })

      this.zoom = 100
    }
    set zoom (zoom) {
      if (zoom < MIN_ZOOM) {
        zoom = MIN_ZOOM
      } else if (zoom > MAX_ZOOM) {
        zoom = MAX_ZOOM
      }
      this.zoomFactorLabel.innerText = zoom + '%'
      this.scale = zoom
      this.mapPane.invalidate()
    }
  }

  me.ZoomToolkit = clazz
}

{
  const MAP_MOUSE_MOVED = 'mapMouseMoved'
  const MAP_MOUSE_CLICKED = 'mapMouseClicked'
  const MAP_MOUSE_DRAGGED = 'mapMouseDragged'

  const FPS = 20
  const REFRESH_DELAY = 1000 / FPS

  const clazz = class {
    constructor (map) {
      this.map = map
      var node = document.getElementById('map_canvas')
      this.displayGrid = true
      this.horizontalSpacing = 30
      this.verticalSpacing = 30
      this.viewport_x = 0
      this.viewport_y = 0
      node.width = node.offsetWidth
      node.height = node.offsetHeight
      this.displayWidth = node.width
      this.displayHeight = node.height
      this.rendering = false
      this.redraw = true
      this.node = node
      this.filterType = null
      this._filteringEnabled = false

      this.zoomToolkit = new me.ZoomToolkit(this)

      this.__render = this.render.bind(this, this.node.getContext('2d'))
      this.initMouseHandlers()
      window.addEventListener('resize', () => {
        this.updateMetrics()
      }, false)
    }
    initMouseHandlers () {
      var domToMapPosition = (x, y) => {
        var scale = this.getScale()
        var viewport = this.getViewportInMapUnits()
        var offset = this.getViewportOffsetInPixels()
        return {
          x: viewport.x + (x + offset.x) / scale,
          y: viewport.y + (y + offset.y) / scale
        }
      }

      var node = this.node
      var mouseDown = null
      var dragging = false
      node.addEventListener('mousedown', (event) => {
        mouseDown = {
          map: domToMapPosition(event.layerX, event.layerY),
          layer: {
            x: event.layerX,
            y: event.layerY
          }
        }
      })

      node.addEventListener('mouseup', (event) => {
        if (mouseDown && !dragging) { // No drag occurred.
          this.emitter.emit(MAP_MOUSE_CLICKED, mouseDown.map, event)
        }
        mouseDown = null
        dragging = false
      })

      node.addEventListener('mousemove', (event) => {
        var pos = domToMapPosition(event.layerX, event.layerY)
        this.emitter.emit(MAP_MOUSE_MOVED, pos, event)
        if (mouseDown) {
          dragging = true
          var scale = this.getScale()
          var delta = {
            x: (event.layerX - mouseDown.layer.x) / scale,
            y: (event.layerY - mouseDown.layer.y) / scale
          }
          this.emitter.emit(MAP_MOUSE_DRAGGED, mouseDown.map, delta, event)
        }
      })

      node.addEventListener('mouseout', () => {
        mouseDown = null
        dragging = false
      })
    }
    getScale () {
      return this.zoomToolkit.scale / 100
    }
    render (ctx) {
      if (this.redraw) {
        var w = this.displayWidth,
          h = this.displayHeight
        ctx.save()
        // Clearing canvas
        ctx.lineWidth = 1
        ctx.fillStyle = '#aaaaaa'
        ctx.strokeStyle = '#000000'

        var scale = this.getScale()
        var viewport = this.getViewportInPixels()
        var offset = this.getViewportOffsetInPixels()
        viewport.x = viewport.x + offset.x
        viewport.y = viewport.y + offset.y

        // Viewport position
        ctx.translate(-viewport.x, -viewport.y)
        ctx.fillRect(viewport.x, viewport.y, w, h)

        // Drawing horizontal guideline
        ctx.beginPath()
        ctx.moveTo(viewport.x, 0)
        ctx.lineTo(viewport.x + w, 0)
        ctx.stroke()

        // Drawing vertical guideline
        ctx.beginPath()
        ctx.moveTo(0, viewport.y)
        ctx.lineTo(0, viewport.y + h)
        ctx.stroke()

        ctx.scale(scale, scale)

        // Drawing grid
        if (this.displayGrid) {
          ctx.lineWidth = 1.0 / scale
          ctx.strokeStyle = '#686868'

          var spacing = this.horizontalSpacing
          var start = Math.round((viewport.x / scale) / spacing) * spacing
          var end = (viewport.x + w) / scale
          for (var gx = start; gx <= end; gx += spacing) {
            if (Math.round(gx) != 0) {
              ctx.beginPath()
              ctx.moveTo(gx, viewport.y / scale)
              ctx.lineTo(gx, (viewport.y + h) / scale)
              ctx.stroke()
            }
          }

          spacing = this.verticalSpacing
          start = Math.round((viewport.y / scale) / spacing) * spacing
          end = (viewport.y + h) / scale
          for (var gy = start; gy <= end; gy += spacing) {
            if (Math.round(gy) != 0) {
              ctx.beginPath()
              ctx.moveTo(viewport.x / scale, gy)
              ctx.lineTo((viewport.x + w) / scale, gy)
              ctx.stroke()
            }
          }
        }

        var objects = this.map.objects
        var object
        var idx
        if (this._filteringEnabled && this.filterType) {
          for (idx = 0; idx < objects.length; ++idx) {
            object = objects[idx]
            if (object.type == this.filterType) {
              object.render(ctx, this._selectedObject == object, scale)
            }
          }
        } else {
          for (idx = 0; idx < objects.length; ++idx) {
            object = objects[idx]
            object.render(ctx, this._selectedObject == object, scale)
          }
        }

        ctx.restore()
        this.redraw = false
      }
      if (this.rendering) {
        setTimeout(this.__render, REFRESH_DELAY)
      }
    }
    setViewportInMapUnits (x, y) {
      this.viewport_x = x
      this.viewport_y = y
    }
    getViewportInMapUnits () {
      return {
        x: this.viewport_x,
        y: this.viewport_y
      }
    }
    getViewportOffsetInMapUnits () {
      var scale = this.getScale()
      var offset = this.getViewportOffsetInPixels()
      return {
        x: offset.x / scale,
        y: offset.y / scale
      }
    }
    getViewportInPixels () {
      var scale = this.getScale()
      return {
        x: this.viewport_x * scale,
        y: this.viewport_y * scale
      }
    }
    getViewportOffsetInPixels () {
      return {
        x: -this.displayWidth / 2,
        y: -this.displayHeight / 2
      }
    }
    isInViewportInMapUnits (x, y) {
      var viewport = this.getViewportInMapUnits()
      var offset = this.getViewportOffsetInMapUnits()
      return Math.abs(x - viewport.x) < -offset.x && Math.abs(y - viewport.y) < -offset.y
    }
    startRendering () {
      this.rendering = true
      window.requestAnimationFrame(this.__render)
    }
    stopRendering () {
      this.rendering = false
    }
    set selectedObject (obj) {
      this._selectedObject = obj
      if (obj && obj.hasOwnProperty('x') && obj.hasOwnProperty('y')) {
        if (!this.isInViewportInMapUnits(obj.x, obj.y)) {
          this.setViewportInMapUnits(obj.x, obj.y)
        }
      }
    }
    get selectedObject () {
      return this._selectedObject
    }
    setGridVisible (visible) {
      this.displayGrid = visible
    }
    isGridVisibile () {
      return this.displayGrid
    }
    setGridHorizontalSpacing (spacing) {
      this.horizontalSpacing = spacing
    }
    getGridHorizontalSpacing () {
      return this.horizontalSpacing
    }
    setGridVerticalSpacing (spacing) {
      this.verticalSpacing = spacing
    }
    getGridVerticalSpacing () {
      return this.verticalSpacing
    }
    updateMetrics () {
      var node = this.node
      node.width = node.offsetWidth
      node.height = node.offsetHeight
      this.displayWidth = node.width
      this.displayHeight = node.height
      this.invalidate()
    }
    invalidate () {
      this.redraw = true
    }
    filterMap (type) {
      this.filterType = type
      this.invalidate()
    }
    set filteringEnabled (filteringEnabled) {
      this._filteringEnabled = filteringEnabled
      this.invalidate()
    }
    get filteringEnabled () {
      return this._filteringEnabled
    }
  }

  clazz.MAP_MOUSE_MOVED = MAP_MOUSE_MOVED
  clazz.MAP_MOUSE_CLICKED = MAP_MOUSE_CLICKED
  clazz.MAP_MOUSE_DRAGGED = MAP_MOUSE_DRAGGED

  me.MapPane = clazz
}
