const electron = require('electron')
window.ipcRenderer = electron.ipcRenderer
window.dialog = electron.remote.dialog
window.fs = electron.remote.require('fs')
window.PWD = electron.remote.process.env.PWD
