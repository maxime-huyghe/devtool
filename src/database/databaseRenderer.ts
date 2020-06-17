import { IpcRenderer } from 'electron'

/**
 * A lot of types are defined here because we can import renderer modules from the
 *  background process but not the oposite.
 */

/** Redefinition of tedious' ColumValue */
export type ColumnValue = {
    metadata: {
        colName: string;
        type: { name: string };
        precision?: number;
        scale?: number;
        dataLength?: number;
    }
    value: any
}

export type DBConnectionHandle = {
    close(i: IpcRenderer): Promise<void>,
    request(i: IpcRenderer, rq: string): Promise<ColumnValue[][]>
}

export enum IpcMessages {
    connect = 'connect',
    close = 'close',
    request = 'request'
}

// see: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
export type InstanceOrPort = Instance | Port
type Instance = {
    kind: 'instance',
    instanceName: string
}
type Port = {
    kind: 'port',
    port: number
}

/** Functions implemented in databaseBackground.ts */

/** To keep the arguments in sync between the different parts of the app */
export type ConnectArgs = { server: string, instanceOrPort: InstanceOrPort, userName: string, password: string, database: string }
export async function connect(ipc: IpcRenderer, args: ConnectArgs): Promise<void> {
    return ipc.invoke(IpcMessages.connect, args)
}

export async function close(ipc: IpcRenderer): Promise<void> {
    return ipc.invoke(IpcMessages.close)
}

export async function request(
    ipc: IpcRenderer, rq: string
): Promise<ColumnValue[][]> {
    return ipc.invoke(IpcMessages.request, rq)
}