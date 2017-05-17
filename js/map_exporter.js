'use strict'

window.me = window.me || {}

{
  const fs = require('fs')
  const MAP_FILE_EXPORTED = 'mapFileExported'

  const packObject = function (object, props) {
    var ret = {}

    ret.x = object.x
    ret.y = object.y
    ret.id = object.id
    ret.type = object.type

    for (var name in props) {
      if (props.hasOwnProperty(name)) {
        var prop = props[name]
        if (prop.type === me.MapObjects.TYPE_DYNAMIC) {
          if (object[name]) {
            me.utils.mixin(ret, packObject(object, object[name]))
          }
        } else {
          ret[name] = object[name]
        }
      }
    }

    return ret
  }

  var clazz = class {
    constructor (map, postExport) {
      this.map = map
      this.postExport = postExport
    }
    exportMap (path) {
      var map = this.map
      var objects = map.objects
      var output = {
        objects: []
      }

      if (map.script) {
        output.script = map.script
      }

      for (var i = 0; i < objects.length; ++i) {
        var object = objects[i]
        var packedObject = object.compile ? object.compile(output) : packObject(object, object.properties)
        if (packedObject) {
          packedObject.type = object.type
          output.objects.push(packedObject)
        }
      }

      var content = JSON.stringify(output)

      fs.writeFile(path, content, (err) => {
        const successCallback = () => {
          this.emitter.emit(MAP_FILE_EXPORTED, path)
        }

        const errorCallback = (err) => {
          alert('Could not write to file "' + path + '": ' + err)
        }

        if (err) {
          errorCallback(err)
          return
        }

        if (this.postExport) {
          this.postExport(path, successCallback, errorCallback)
        } else {
          successCallback()
        }
      })
    }
  }

  clazz.MAP_FILE_EXPORTED = MAP_FILE_EXPORTED

  me.MapExporter = clazz
}
