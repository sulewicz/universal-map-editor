'use strict'

window.me = window.me || {}

{
  let instance

  const clazz = class {
    constructor () {
      instance = this
      this.map = new me.Map()
      this.mapObjects = new me.MapObjects()
      this.mapView = new me.MapPane(this.map)
      this.toolBox = new me.ToolBox()
      this.objectListBox = new me.ObjectListBox(this.map)
      this.propertiesBox = new me.PropertiesBox()
      this.statusBar = new me.StatusBar()
      this.mapIo = new me.MapIo(this.map, this.mapObjects)
      this.mapExporter = new me.MapExporter(this.map, me.Metadata.postExport)
      this.menuBar = new me.MenuBar(this.mapIo, this.mapExporter)
      this.mapToolsPane = new me.MapToolsPane(this.mapView, this.objectListBox)

      this.init()
    }
    init () {
      this.mapObjects.createClasses(me.Metadata.objects)
      this.initToolbox()
      this.mapView.startRendering()
    }
    initToolbox () {
      var objects = this.mapObjects.getAvailableTypes()
      for (var i = 0; i < objects.length; ++i) {
        var object = objects[i]
        this.toolBox.addItem(object.label, object.type)
      }
    }
  }

  clazz.getInstance = function() {
    return instance
  }

  me.Editor = clazz
}
