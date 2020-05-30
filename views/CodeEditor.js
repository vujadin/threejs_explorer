'use strict'

let CodeEditor = function() {
	
	let monacoEditor = null;
	
	let cwd = process.cwd();
	
	const amdLoader = require('./vendor/monaco-editor/min/vs/loader.js');
	const amdRequire = amdLoader.require;
	const amdDefine = amdLoader.require.define;

	function uriFromPath(_path) {
		var pathName = path.resolve(_path).replace(/\\/g, '/');
		if (pathName.length > 0 && pathName.charAt(0) !== '/') {
			pathName = '/' + pathName;
		}
		return encodeURI('file://' + pathName);
	}
	amdRequire.config({
		baseUrl: uriFromPath(path.join(__dirname, '/vendor/monaco-editor/min'))
	});

	// workaround for monaco-css not understanding the environment
	self.module = undefined;
	
	let saveChanges = function() {
		if (document.getElementById('codeEditor').scriptLoaded) {
			fs.writeFileSync(cwd + "/three.js-master/examples/tmpScript.js", monacoEditor.getValue());
			document.getElementById("previewIFrame").src = cwd + "/three.js-master/examples/index_tmp.html?ver=" + Math.random();
		}
		else {
			alert("No example loaded!\nLoad an example first.");
		}
	};
	
	let me = this;
	
	this.loadScript = function(data) {
		monacoEditor.setValue(data);
		monacoEditor.layout();
	};

	amdRequire(['vs/editor/editor.main'], function() {
		monacoEditor = monaco.editor.create(document.getElementById('codeEditor'), {
			language: 'javascript',
			theme: 'vs-dark',
			automaticLayout: true,
			wordWrap: true,
			fontSize: 15
		});
		document.getElementById('codeEditor').loadScript = me.loadScript;
		document.getElementById('codeEditor').resizeCodeEditor = function() { monacoEditor.layout(); };
		monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
			saveChanges();
		});
		monacoEditor.addCommand(monaco.KeyCode.F5, function() {
			saveChanges();
		});
		monacoEditor.layout();
	});
	
};
