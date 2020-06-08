'use strict'

// Main electron thread. Mostly copy-pasted code.

import { app, protocol, BrowserWindow } from 'electron'
import {
    createProtocol,
    installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800, height: 600, webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION as boolean | undefined
        }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }

    win.on('closed', () => {
        win = null
    })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        // Devtools extensions are broken in Electron 6.0.0 and greater
        // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
        // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
        // If you are not using Windows 10 dark mode, you may uncomment these lines
        // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
        try {
            await installVueDevtools()
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }

    }
    createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', data => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}

import { Connection, Request, ConnectionConfig, ColumnValue } from "tedious";

let config: ConnectionConfig = {
    server: 'localhost',
    authentication: {
        type: 'default',
        options: {
            userName: 'SA',
            password: 'P@55w0rd123',
        },
    },
    options: {
        database: 'test',
        trustServerCertificate: true,
        rowCollectionOnRequestCompletion: true,
    },
}

let connection: Connection = new Connection(config)

connection.on('connect', async (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Connected')
        try {
            let rows = await executeSql(connection, 'select * from test')
            rows.forEach((columns) => columns.forEach((col) => console.log(col.value)))
        } catch (error) {
            console.log(error)
        }
    }
})

async function executeSql(cn: Connection, query: string): Promise<ColumnValue[][]> {
    return new Promise((resolve, reject) => {
        let request = new Request(query, async (err, _rowCount, rows) => {
            if (err) {
                reject(err);
            }

            resolve(rows as ColumnValue[][])
        });

        connection.execSql(request);
    })
}
