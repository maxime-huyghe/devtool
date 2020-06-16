import { Connection, Request, ConnectionConfig, ColumnValue } from "tedious";
import { IpcMain, IpcMainInvokeEvent } from 'electron';
import { IpcMessages } from './databaseRenderer';

/** Global connection object */
let connection: Connection | null

export function installCallbacks(ipcMain: IpcMain) {
    ipcMain

    // Usable once at program start, and then each time the close handler is invoked
    ipcMain.handle(IpcMessages.connect, connectionHandler)
    ipcMain.handle(IpcMessages.request, requestHandler)
    ipcMain.handle(IpcMessages.close, closeHandler)
}

const connectionHandler = async (event: IpcMainInvokeEvent, server: string, port: number, userName: string, password: string, database: string): Promise<void> => {
    console.log('connect')
    let config: ConnectionConfig = {
        server,
        authentication: {
            type: 'default',
            options: {
                userName,
                password,
            },
        },
        options: {
            database,
            port,
            trustServerCertificate: true,
            rowCollectionOnRequestCompletion: true,
            encrypt: true,
            appName: 'devtool'
        },
    }

    try {
        connection = await newConnection(config)
        return
    } catch (err) {
        throw err
    }
}

const requestHandler = (event: IpcMainInvokeEvent, rq: string): Promise<ColumnValue[][]> =>
    new Promise((resolve, reject) => {
        console.log('request')
        let request = new Request(rq, (err, _rowCount, rows) => {
            if (err) {
                reject((err));
            }

            resolve(rows as ColumnValue[][])
        });

        connection!.execSql(request);
    })

const closeHandler = (event: IpcMainInvokeEvent): Promise<void> =>
    new Promise((resolve, reject) => {
        console.log('close')

        if (connection) {
            connection.on('end', () => {
                resolve()
            })
            connection.close()
            connection = null
        } else {
            resolve()
        }
    })


let newConnection = async (config: ConnectionConfig): Promise<Connection> => new Promise((resolve, reject) => {
    let connection = new Connection(config)

    connection.on('connect', async (err) => {
        if (err) {
            connection.close()
            console.log(err)
            reject(err)
        } else {
            resolve(connection)
        }
    })
})
