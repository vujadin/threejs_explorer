'use strict'

let ExamplesTreeView = function(container, state) {
	
	let cwd = process.cwd();
	
	let contentDiv = document.createElement('div');
	contentDiv.style.cssText = 'width: 100%; height: 100%;';
	container.getElement().append(contentDiv);
	
	let filterDiv = document.createElement('div');
	filterDiv.id = "filterDiv";
	let filterInputField = document.createElement('input');
	filterInputField.id = "filterInputField";
	filterInputField.placeholder = "Filter...";
	filterInputField.autocomplete = "off";
	filterDiv.appendChild(filterInputField);
	let btnReset = document.createElement('button');
	btnReset.id = "btnResetFilter";
	btnReset.innerHTML = "&times;";
	btnReset.title = "Clear filter";
	filterDiv.appendChild(btnReset);
	let filterMatchesSpan = document.createElement('span');
	filterMatchesSpan.id = "filteredNum";
	filterDiv.append(filterMatchesSpan);
	contentDiv.append(filterDiv);
	
	let treeHolder = document.createElement('div');
	treeHolder.id = "treeHolder";
	contentDiv.appendChild(treeHolder);
	
	let str = fs.readFileSync(cwd + "/three.js-master/examples/files.js", "utf8");
	let openBracketIdx = str.indexOf('{');
	let closeBracketIdx = str.indexOf('}');
	str = str.substr(openBracketIdx, closeBracketIdx - openBracketIdx + 1);
	let json = dJSON.parse(str);
	
	let treeStruct = [];	// json structure for fancytree...
	let categories = Object.keys(json);
	categories.forEach(function(c, i) {
		let entry = {
			title: c,
			folder: true,
			expanded: false,
			children: []
		};
		json[c].forEach(function(e, i) {
			let subEntry = {
				title: e,
				type: "example"
			};
			entry.children.push(subEntry);
		});
		treeStruct.push(entry);
	});

	let customFolder = {
		title: 'CUSTOM',
		key: 'myStuff',
		folder: true,
		expanded: false,
		children: []
	};
	treeStruct.push(customFolder);

	if (fs.existsSync(cwd + "/customScripts")) {
		fs.readdirSync(cwd + "/customScripts").forEach(function(item) {
			if (item.endsWith('.dat')) {
				let customEntry = {
					title: item.replace('.dat', ''),
					type: "example",
					custom: true
				};
				customFolder.children.push(customEntry);
			}
		});
	}
	
	let treeView = document.createElement('div');
	treeView.id = 'examplesTreeView';
	treeHolder.append(treeView);
	$(treeView).fancytree({
		source: treeStruct,
		filter: {
			autoApply: false,   // Re-apply last filter if lazy data is loaded
			autoExpand: false, // Expand all branches that contain matches while filtered
			counter: false,     // Show a badge with number of matching child nodes near parent icons
			fuzzy: false,      // Match single characters in order, e.g. 'fb' will match 'FooBar'
			hideExpandedCounter: true,  // Hide counter badge if parent is expanded
			hideExpanders: true,       // Hide expanders if all child nodes are hidden by filter
			highlight: true,   // Highlight matches by wrapping inside <mark> tags
			leavesOnly: false, // Match end nodes only
			nodata: true,      // Display a 'no data' status node if result is empty
			mode: "dimm"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
		},
		extensions: ["childcounter", "filter"],
		childcounter: {
			deep: true,
			hideZeros: true,
			hideExpanded: true
		},
		activate: function(event, data) {
			if (data.node.folder !== true) {
				if (data.node.data.custom) {
					let scriptData = JSON.parse(fs.readFileSync(cwd + "/customScripts/" + data.node.title + ".dat", "utf8"));
					window.loadedExample = scriptData.htmlFile.replace('.html', '');
					let exampleHTML = fs.readFileSync(cwd + "/three.js-master/examples/" + scriptData.htmlFile, "utf8");
					let tmpScript = scriptData.content;
					let scriptStart = exampleHTML.indexOf('<script type="module">') + '<script type="module">'.length;
					let scriptEnd = exampleHTML.indexOf('</script>', scriptStart);
					let tmpHTML = exampleHTML.substr(0, scriptStart - '<script type="module">'.length) + 
						"<script type='module' src='tmpScript.js'>" + 
							exampleHTML.substr(scriptEnd, exampleHTML.length);

					fs.writeFileSync(cwd + "/three.js-master/examples/index_tmp.html", tmpHTML);					
					fs.writeFileSync(cwd + "/three.js-master/examples/tmpScript.js", tmpScript);
					
					document.getElementById("previewIFrame").src = cwd + "/three.js-master/examples/index_tmp.html";
					
					window.signals.loadScript.dispatch(tmpScript);
				}
				else {
					window.loadedExample = data.node.title;
					let exampleHTML = fs.readFileSync(cwd + "/three.js-master/examples/" + data.node.title + ".html", "utf8");
					let scriptStart = exampleHTML.indexOf('<script type="module">') + '<script type="module">'.length;
					let scriptEnd = exampleHTML.indexOf('</script>', scriptStart);
					let tmpScript = exampleHTML.substr(scriptStart, scriptEnd - scriptStart);
					let tmpHTML = exampleHTML.substr(0, scriptStart - '<script type="module">'.length) + 
						"<script type='module' src='tmpScript.js'>" + 
							exampleHTML.substr(scriptEnd, exampleHTML.length);

					fs.writeFileSync(cwd + "/three.js-master/examples/index_tmp.html", tmpHTML);					
					fs.writeFileSync(cwd + "/three.js-master/examples/tmpScript.js", tmpScript);
					
					document.getElementById("previewIFrame").src = cwd + "/three.js-master/examples/index_tmp.html";
					
					window.signals.loadScript.dispatch(tmpScript.replace(/^\t\t\t/gm, ''));
				}
			}
		}
    });
	
	let fancyTreeRoot = $(treeView).fancytree("getTree");
	let myStuffNode = fancyTreeRoot.getNodeByKey("myStuff");
	myStuffNode.li.className += " myStuff";
	myStuffNode.renderTitle();
	
	$(filterInputField).keyup(function(e){
		fancyTreeRoot.clearFilter();

		let n,
			tree = $.ui.fancytree.getTree(),
			args = "autoApply autoExpand fuzzy hideUnmatchedNodes highlight leavesOnly nodata".split(" "),
			opts = {},
			filterFunc = tree.filterBranches, //tree.filterNodes,
			match = $(this).val();

		$.each(args, function(i, o) {
			opts[o] = true;
		});
		opts.mode = "hide";

		if (e && e.which === $.ui.keyCode.ESCAPE || $.trim(match) === "") {
			$(btnReset).click();
			return;
		}
		
		n = filterFunc.call(tree, function(node) {
			let ret = new RegExp(match, "i").test(node.title);
			return ret;
		}, opts);

		$(btnReset).attr("disabled", false);
		$(filterMatchesSpan).text(n);
	}).focus();

	$(btnReset).click(function(e){
		$(filterInputField).val("");
		$(filterMatchesSpan).text("");
		fancyTreeRoot.clearFilter();
	}).attr("disabled", true);

	window.signals.saveChanges.add(function(data) {
		let customScriptName = data.name;

		if (fancyTreeRoot) {	
			let name = customScriptName;
			if (name == undefined || name == null) {
				return;
			}

			if (fancyTreeRoot.getNodeByKey(name) == null) {
				let rootNode = fancyTreeRoot.getNodeByKey("myStuff");				
				let childNode = rootNode.addChildren({
					title: name,
					data: { "key": name, "name": name, "custom": true }
				}, rootNode.getFirstChild());
				childNode.key = name;
			}

			fancyTreeRoot.activateKey(name);
		}
	});
	
};
