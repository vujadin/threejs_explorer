(function() {
	
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
		
		window.layout = appLayout;
		
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
	};
	
	let ipcr = require('electron').ipcRenderer;
	ipcr.on('saveLayout', function(event, message) {
		let customLayout = null;
		try {
			customLayout = appLayout.toConfig();
		}
		catch( err ) {
			console.log(err);
		}
		
		if (customLayout != null) {
			fs.writeFileSync(path.join(__dirname, "/layouts/custom.json"), JSON.stringify(customLayout, null, 4), "utf-8");				
		}
	});
	
	if (!fs.existsSync(process.cwd() + "/three.js-master")) {
		new ThreeDownloader(initApp);
	}
	else {
		initApp();
	}

}());
