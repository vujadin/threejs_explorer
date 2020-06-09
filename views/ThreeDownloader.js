'use strict'

let ThreeDownloader = function(callback) {
	
	let threejs_url = "https://github.com/mrdoob/three.js/archive/master.zip";
	let threejs_fileName = "three.js-master.zip";
	
	let tips = [
		"<span class='tipgreen'>Tip: </span>Use CTRL+S or F5 to reload example with your modifications.",
		"<span class='tipgreen'>Tip: </span>Arrange panels as you like. App will save your layout settings.",
		"<span class='tipgreen'>Tip: </span>App doesn't modify three.js examples in any way, so you have full freedom to modify and <i>brake</i> the code. It's the best way to learn!",
		"<span class='tipgreen'>Tip: </span>Version 0.0.2 brings more flexibility as you can now save your changes as custom scripts. Click on a <img src='assets/save.png' /> icon to save your work. Your scripts will show up in 'CUSTOM' folder in the tree-view."
	];
	let loopTipInterval = -1;
	let tipsCount = 0;
	let tipTime = 4000;	// 5 sec
	
	let cwd = process.cwd();
	
	let downloadStarted = false;
	let downloadAttempts = 0;
	
	let receivedBytes = 0;	
	let totalBytes = 0;
	
	let downloadScreen = document.createElement('div');
	downloadScreen.id = 'downloadScreen';
	downloadScreen.innerHTML = '' +
	'<div class="wrapper">' +
	'	<h1>Three.js explorer v0.0.2</h1><br/>' +
	'	<span class="instructions">Welcome to "Three.js explorer"!</span>' +
	'	<span class="instructions">To start using the app, you must first download Three.js repository.</span>' +
	'	<span class="instructions" id="downloadingMsg">Click button below to start downloading.</span><br/>' + 
	'	<span id="startDownload" class="fancy-button green">Download</span><br/>' +
	'	<div class="green">' +
	'		<div class="progress zoomZero">' +
	'			<div class="load" id="working">' +
	'				<hr/><hr/><hr/><hr/>' +
	'			</div>' +
    '			<div class="inner">' +
    '   			<div class="percent" id="loadedPercentage"><span>0</span>%</div>' +
    '    			<div class="water"></div>' +
    '    			<div class="glare"></div>' +
    '   		</div>' +
    '		</div>' +
	'	</div>' +
	'	<br/><br/><section id="tips">' +
    '		Use CTRL+S or F5 to reload example with your modifications.' +
    '	</section>' +
	'</div>';
	document.body.appendChild(downloadScreen);
	
	let loopTips = function() {
		loopTipInterval = setInterval(function() {
			$('#tips').html(tipsCount < tips.length ? tips[++tipsCount] : tips[tipsCount = 0]);
		}, 4000);
	};
	let stopLoopTips = function() {
		clearInterval(loopTipInterval);
	};
	
	let updateProgressBar = function(val) {
		var colorInc = 100 / 3;
		val = val.toFixed(1);
		if (val <= 100 && val >= 0) {
			console.log(val);
      
			var valOrig = val;
			val = 100 - val;
      
			if (valOrig == 0) {
				$("#percent-box").val(0);
				$(".progress .percent").text(0 + "%");
			}
			else $(".progress .percent").text(valOrig + "%");
      
			$(".progress").parent().removeClass();
			$(".progress .water").css("top", val + "%");
      
			if (valOrig < colorInc * 1) {
				$(".progress").parent().addClass("red");
			}
			else if (valOrig < colorInc * 2) {
				$(".progress").parent().addClass("orange");
			}
			else {
				$(".progress").parent().addClass("green");
			}
		}
	};
	updateProgressBar(0);
	
	let tryDownload = function(url, filename, callback) {
		if (!downloadStarted) {
			downloadStarted = true;
			
			$('#tips').text("Getting file size...");
			
			remoteFileSize(url, function(err, fsize) {
				console.log(err, fsize);
				if (err == null) {
					startDownload(url, filename, callback, fsize);
				}
				else if (downloadAttempts < 50) {
					downloadStarted = false;
					++downloadAttempts;
					setTimeout(function() {
						tryDownload(url, filename, callback);
					}, 100);
				}
				else {
					//downloadStarted = false;
					startDownload(url, filename, callback);
				}
			});
		}
	};
	
	let startDownload = function(url, filename, callback, fileSize) {
		$('#tips').html('<span class="tipgreen">Tip: </span>Use CTRL+S or F5 to reload example with your modifications.');
		$('#downloadingMsg').text("Download started...");
		loopTips();
		$('div.progress').removeClass('zoomZero').toggleClass('zoomOne');
		totalBytes = fileSize;
		console.log(totalBytes);
		const file = fs.createWriteStream(filename);
		request.get(url)
		.on('response', (response) => {
			if (response.statusCode !== 200) {
				return callback('Response status was ' + response.statusCode);
			}				
		})
		.on('data', (chunk) => {
			receivedBytes += chunk.length;
			updateProgressBar((receivedBytes / totalBytes) * 100);
		})
		.pipe(file)
		.on('error', (err) => {
			fs.unlink(filename);
			stopLoopTips();
			return callback(err.message);
		});
		file.on('finish', () => {				
			file.close();
			async function extract() {
				stopLoopTips();
				$('#tips').html('<span class="tipgreen">Generating directory structure and unpacking files. Please wait...</span>');
				$('#loadedPercentage').css('display', 'none');
				$('#working').css('display', 'block');
				await extractZip(path.join(cwd, "three.js-master.zip"), { dir: cwd });				
				fs.unlink(filename);
				callback();
				document.getElementById('downloadScreen').remove();
			}
			extract();
		});
		file.on('error', (err) => {
			fs.unlink(filename); 
			stopLoopTips();
			return callback(err.message);
		});
	};
	
	$('#startDownload').on('click', function(e) {
		$('#tips').removeClass('zoomZero').toggleClass('zoomOne');
		$('#startDownload').toggleClass('zoomZero');
		tryDownload(threejs_url, threejs_fileName, callback);
	});
	
};