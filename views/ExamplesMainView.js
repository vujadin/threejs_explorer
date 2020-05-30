'use strict'

let ExamplesMainView = function(container, state) {
	
	let contentDiv = document.createElement('div');
	contentDiv.style.cssText = 'width: 100%; height: 100%;';
	container.getElement().append(contentDiv);
	
	contentDiv.innerHTML = '<iframe frameborder="0" id="previewIFrame" src="' + __dirname + '/intro/index.html"></iframe>';
	
};
