'use strict'

let CodeEditor = function() {

	let me = this;
	
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
		if (me.scriptLoaded) {
			fs.writeFileSync(cwd + "/three.js-master/examples/tmpScript.js", monacoEditor.getValue());
			document.getElementById("previewIFrame").src = cwd + "/three.js-master/examples/index_tmp.html?ver=" + Math.random();
		}
		else {
			alert("No example loaded!\nLoad an example first.");
		}
	};

	let saveCustomScript = function() {
		if (me.scriptLoaded && window.loadedExample) {
			let newScript = {
				htmlFile: window.loadedExample + ".html",
				content: monacoEditor.getValue()
			};
			if (!fs.existsSync(path.join(cwd + "/customScripts"))) {
				fs.mkdirSync(path.join(cwd + "/customScripts"));
			}

			require('electron').ipcRenderer.send('save-script', { data: JSON.stringify(newScript) });
		}
	};
	
	this.loadScript = function(data) {
		monacoEditor.setValue(data);
		monacoEditor.layout();
	};

	this.resize = function() {
		if (monacoEditor) {
			monacoEditor.layout();
		}
	};

	amdRequire(['vs/editor/editor.main'], function() {
		monacoEditor = monaco.editor.create(document.getElementById('codeEditor'), {
			language: 'javascript',
			theme: 'vs-dark',
			automaticLayout: true,
			wordWrap: true,
			fontSize: 15
		});
		monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {
			saveChanges();
		});
		monacoEditor.addCommand(monaco.KeyCode.F5, function() {
			saveChanges();
		});
		monacoEditor.layout();
	});

	window.signals.saveScriptButtonClicked.add(saveCustomScript);
	
};
