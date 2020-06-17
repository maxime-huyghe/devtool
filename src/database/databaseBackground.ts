import { Connection, Request, ConnectionConfig, ColumnValue } from "tedious";
import { IpcMain, IpcMainInvokeEvent } from 'electron';
import { IpcMessages, InstanceOrPort, ConnectArgs } from './databaseRenderer';

/** Global connection object */
let connection: Connection | null

export function installCallbacks(ipcMain: IpcMain) {
    ipcMain

    // Usable once at program start, and then each time the close handler is invoked
    ipcMain.handle(IpcMessages.connect, connectionHandler)
    ipcMain.handle(IpcMessages.request, requestHandler)
    ipcMain.handle(IpcMessages.close, closeHandler)
}

const connectionHandler = async (event: IpcMainInvokeEvent, a: ConnectArgs): Promise<void> => {
    console.log('connect')
    const iop = a.instanceOrPort.kind == 'instance'
        ? { instanceName: a.instanceOrPort.instanceName }
        : { port: a.instanceOrPort.port }

    let config: ConnectionConfig = {
        server: a.server,
        authentication: {
            type: 'default',
            options: {
                userName: a.userName,
                password: a.password,
            },
        },
        options: {
            database: a.database,
            trustServerCertificate: true,
            rowCollectionOnRequestCompletion: true,
            encrypt: true,
            appName: 'devtool',
            ...iop
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
