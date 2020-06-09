'use strict'

let CodeEditorView = function(container, state) {
	
	let contentDiv = document.createElement('div');
	contentDiv.style.cssText = 'width: 100%; height: 100%;';
	container.getElement().append(contentDiv);
	
	let codeEditorDiv = null;
	
	if (document.body._codeEditor == null) {
		codeEditorDiv = document.createElement('div');
		codeEditorDiv.id = 'codeEditor';
		codeEditorDiv.style.cssText = 'width: 100%; height: 100%;';
		contentDiv.append(codeEditorDiv);
		document.body._codeEditor = codeEditorDiv;
	}
	else {
		codeEditorDiv = document.body._codeEditor;
		codeEditorDiv.style.display = "block";
		contentDiv.append(codeEditorDiv);
	}
	
	container.on('resize', function(e) {
		window.signals.codeEditorResize.dispatch();
	});

	container.on('tab', function(tab) {
		let saveButton = new Image();
		saveButton.title = "Save changes";
		saveButton.className = "saveButton";
		saveButton.src = "./assets/save.png";
		tab.element.append(saveButton);

		saveButton.addEventListener("click", function(e) {
			window.signals.saveScriptButtonClicked.dispatch();
		});
	});
	
};
