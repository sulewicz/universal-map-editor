"use strict";

var path = require('path');
var bridge = require('./js/node_bridge.js')

window.onload = function() {
	var editorNode = document.getElementById('editor');
  	var errorNode = document.getElementById('error');
  	if (me.Metadata) {
  		editorNode.style.display = 'grid';
		var editor = new me.Editor();
  		var controller = new me.EditorController(editor);
  	} else {
  		errorNode.innerHTML = 'No <b>game_metadata.js</b> file found in ' + path.resolve(bridge.__dirname, '../../') 
  			+ '/.<br>You can copy one from ' + path.resolve(bridge.__dirname, '../sample/') + '/.';
  		errorNode.style.display = 'block';
  	}
};
