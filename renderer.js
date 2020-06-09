(function() {

	let Signal = module.exports.Signal;
	
	window.signals = {		
		saveChanges: new Signal(),
		loadScript: new Signal(),
		codeEditorResize: new Signal(),
		saveScriptButtonClicked: new Signal()
	};
	
	let appLayout = null;
	let initApp = function() { 
		let configDefault = {
			settings: {
				hasHeaders: true,
				reorderEnabled: true,
				selectionEnabled: false,
				popoutWholeStack: false,
				blockedPopoutsThrowError: true,
				closePopoutsOnUnload: true,
				showPopoutIcon: false,
				showMaximiseIcon: true,
				showCloseIcon: false
			},
			content: [{
				type: 'row',
				content: [{
					width: 80,
					type: 'row',
					content: [{
						title: 'Examples',
						width: 20,
						//header: { show: 'bottom' },
						type: 'component',
						isClosable: false,
						componentName: 'ExamplesTreeView',
						componentState: { }
					},
					{
						type: 'stack',
						content: [{
							type: 'component',
							title: 'Preview',
							isClosable: false,
							componentName: 'ExamplesMainView',
							componentState: { }
						},
						{
							type: 'component',
							title: 'Code',
							isClosable: false,
							componentName: 'CodeEditorView',
							componentState: { }
						}]
					}]
				}]
			}]
		};
		
		if (fs.existsSync(path.join(__dirname, "/layouts/custom.json"))) {
			configDefault = JSON.parse(fs.readFileSync(path.join(__dirname, "/layouts/custom.json"), "utf8"));
		}
		
		appLayout = GoldenLayout ? new GoldenLayout(configDefault) : new window.GoldenLayout(configDefault);
		appLayout.registerComponent('ExamplesMainView', ExamplesMainView);
		appLayout.registerComponent('ExamplesTreeView', ExamplesTreeView);
		appLayout.registerComponent('CodeEditorView', CodeEditorView);
		appLayout.init();
				
		window.changeLayout = function(type) {
			let layoutCfg = JSON.parse(fs.readFileSync(path.join(__dirname, "/layouts/type" + type + ".json"), "utf8"));
			document.body._codeEditor.style.display = "none";
			document.body.append(document.body._codeEditor);
			appLayout.destroy();
			
			appLayout = GoldenLayout ? new GoldenLayout(layoutCfg) : new window.GoldenLayout(layoutCfg);			
			appLayout.registerComponent('ExamplesMainView', ExamplesMainView);
			appLayout.registerComponent('ExamplesTreeView', ExamplesTreeView);
			appLayout.registerComponent('CodeEditorView', CodeEditorView);
			appLayout.init();
		};
		
		let codeEditor = new CodeEditor();
		window.signals.loadScript.add(function(data) {
			codeEditor.loadScript(data);
			codeEditor.scriptLoaded = true;
		});
		window.signals.saveChanges.add(function(data) {

		});
		window.signals.codeEditorResize.add(function() {
			codeEditor.resize();
		});
	};
	
	let ipcr = require('electron').ipcRenderer;
	ipcr.on('saveLayout', function(event, msg) {
		let customLayout = null;
		customLayout = appLayout.toConfig();		
		if (customLayout) {
			fs.writeFileSync(path.join(__dirname, "/layouts/custom.json"), JSON.stringify(customLayout, null, 4), "utf-8");	
		}
	});
	ipcr.on('set-custom-script-active', function(event, msg) {
		window.signals.saveChanges.dispatch(msg);
	});
	
	if (!fs.existsSync(process.cwd() + "/three.js-master")) {
		new ThreeDownloader(initApp);
	}
	else {
		initApp();
	}

}());
