// Modules to control application life and create native browser window
const electron = require('electron');
const {app, BrowserWindow} = require('electron');
const path = require('path');
const Menu = electron.Menu;
const dialog = electron.dialog;


let otherWindows = [];
let mainWindow = null;
function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 950,
        height: 700,
        webPreferences: {
		    nodeIntegration: true
	    }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');
  
    Menu.setApplicationMenu(null);
  
    mainWindow.on('close', function (e) {
	    mainWindow.webContents.send('saveLayout', '');
	    //e.preventDefault()
    });

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    const {ipcMain} = require('electron');
    ipcMain.on('save-script-finished', function(event, arg) {
        mainWindow.webContents.send('set-custom-script-active', arg);
    });
    ipcMain.on('save-script', function(event, arg) {
        showSaveCustomScriptDialog(arg);
    });
}

function showSaveCustomScriptDialog(data) {
    const modalPath = 'modal/newscript.html';
    let win = new electron.BrowserWindow({
        modal: true,
        parent: mainWindow,
        width: 450, 
        height: 160,
        frame: false,
        'accept-first-mouse': true,
        'title-bar-style': 'hidden',
        webPreferences: { nodeIntegration: true }
    });
    
    otherWindows.push(win);

    win.on('close', () => { 
        otherWindows.splice(otherWindows.indexOf(win), 1); 
        win = null; 
    });
    win.webContents.on('did-finish-load', function() {
        win.webContents.send('script-data', data);
    });
    win.loadFile(modalPath);
    win.setResizable(false);
    win.setAlwaysOnTop(true);
    win.setMenu(null);
    win.setTitle("Script name");
    win.show();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow();
  
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
