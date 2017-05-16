'use strict'

window.onload = function () {
	const editorNode = document.getElementById('editor')
	const errorNode = document.getElementById('error')
	if (me.Metadata) {
		editorNode.style.display = 'block'
		const editor = new me.Editor()
		const controller = new me.EditorController(editor)
	} else {
		errorNode.innerHTML = 'No <b>gameMetadata.js</b> file found in ' + path.resolve(__dirname, '../../') + '.<br>You can copy one from ' + path.resolve(__dirname, '../sample/') + '.'
		errorNode.style.display = 'block'
	}
}
