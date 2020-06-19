import { Connection, Request, ConnectionConfig, ColumnValue } from "tedious";
import { IpcMain, IpcMainInvokeEvent } from 'electron';
import { IpcMessages, ConnectArgs } from './databaseRenderer';

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
    const { server, instanceOrPort, userName, password, database, encrypt, useTLSv1, authType } = a

    const iop = instanceOrPort.k == 'instance'
        ? { instanceName: instanceOrPort.instanceName }
        : { port: instanceOrPort.port }
    const tls = useTLSv1
        ? { cryptoCredentialsDetails: { minVersion: "TLSv1" } }
        : {}

    let config: ConnectionConfig = {
        server,
        authentication: {
            type: authType.k,
            options: {
                userName,
                password,
                ...authType.k == "ntlm" ? { domain: authType.domain } : {}
            },
        },
        options: {
            connectTimeout: 3000,
            database,
            trustServerCertificate: true,
            rowCollectionOnRequestCompletion: true,
            encrypt,
            appName: 'devtool',
            ...iop,
            ...tls
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

    // Typings are not up to date
    let _c: any = connection
    if (_c.connect !== undefined && typeof _c.connect == "function")
        _c.connect()

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
