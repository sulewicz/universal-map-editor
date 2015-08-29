"use strict";

var path = require('path');
var bridge = require('./js/node_bridge.js')

var gui = require('nw.gui');
var menuBar = new gui.Menu({
	type: 'menubar'
});
if (menuBar.createMacBuiltin) {
	menuBar.createMacBuiltin('Universal Editor', {
		hideEdit: false,
	});
	gui.Window.get().menu = menuBar;
}

window.onload = function () {
	var editorNode = document.getElementById('editor');
	var errorNode = document.getElementById('error');
	if (me.Metadata) {
		editorNode.style.display = 'block';
		var editor = new me.Editor();
		var controller = new me.EditorController(editor);
	} else {
		errorNode.innerHTML = 'No <b>game_metadata.js</b> file found in ' + path.resolve(bridge.__dirname, '../../') + '/.<br>You can copy one from ' + path.resolve(bridge.__dirname, '../sample/') + '/.';
		errorNode.style.display = 'block';
	}
};