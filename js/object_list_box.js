'use strict'

window.me = window.me || {}

{
  const PREFIX = 'objects_list_box_'
  const SELECTED_CLASSNAME = 'selected'
  const ITEM_CLASSNAME = 'object_list_box_item'

  const LIST_OBJECT_CLICKED = 'listObjectClicked'

  const TYPE_ATTRIBUTE = 'object_type'

  const clazz = class {
    constructor (map) {
      this.map = map
      this.node = document.getElementById('object_list_box')
      this._selectedObject = null
      this.filterType = null
      this._filteringEnabled = false
      this.rebuild()
    }
    createItem (obj) {
      var node = document.createElement('span')
      node.id = PREFIX + obj.id
      node.className = ITEM_CLASSNAME
      node.setAttribute(TYPE_ATTRIBUTE, obj.type)
      node.innerHTML = obj.getLabel()
      this.node.appendChild(node)
      node.addEventListener('click', function () {
        this.emitter.emit(LIST_OBJECT_CLICKED, obj)
      }.bind(this))
    }
    addObject (obj) {
      this.rebuild(obj, false)
    }
    updateObject (obj) {
      this.getNode(obj.id).innerHTML = obj.getLabel()
    }
    removeObject (obj) {
      this.rebuild(obj, true)
    }
    rebuild (obj, removed) {
      if (obj) {
        if (removed) {
          if (obj == this._selectedObject) {
            this._selectedObject = null
          }
          var node = this.getNode(obj.id)
          node.parentNode.removeChild(node)
        } else {
          this.createItem(obj)
        }
      } else {
        this._selectedObject = null
        this.node.innerHTML = ''
        var objects = this.map.objects
        for (var idx = 0; idx < objects.length; ++idx) {
          var item = objects[idx]
          this.createItem(item)
        }
      }
      this.filterList(this.filterType)
    }
    set selectedObject (obj) {
      if (this._selectedObject) {
        this.getNode(this._selectedObject.id).classList.remove(SELECTED_CLASSNAME)
      }
      this._selectedObject = obj
      if (obj) {
        this.getNode(this._selectedObject.id).classList.add(SELECTED_CLASSNAME)
      }
    }
    get selectedObject () {
      return this._selectedObject
    }
    filterList (type) {
      this.filterType = type
      if (!this._filteringEnabled) {
        type = null
      }
      var items = this.node.children
      for (var i = 0; i < items.length; ++i) {
        var item = items[i]
        item.style.display = (!type || item.getAttribute(TYPE_ATTRIBUTE) === type) ? 'block' : 'none'
      }
    }
    set filteringEnabled (filteringEnabled) {
      this._filteringEnabled = filteringEnabled
      this.filterList(this.filterType)
    }
    get filteringEnabled () {
      return this._filteringEnabled
    }
    getNode (id) {
      return document.getElementById(PREFIX + id)
    }
  }

  clazz.LIST_OBJECT_CLICKED = LIST_OBJECT_CLICKED

  me.ObjectListBox = clazz
}
