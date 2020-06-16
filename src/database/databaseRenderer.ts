import { IpcRenderer } from 'electron'

/** Redefinition of tedious' ColumValue because it cannot be imported in the renderer process */
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

/** Functions implemented in databaseBackground.ts */
export async function connect(
    ipc: IpcRenderer, url: string, port: number, username: string, password: string, database: string
): Promise<void> {
    return ipc.invoke(IpcMessages.connect, url, port, username, password, database)
}

export async function close(ipc: IpcRenderer): Promise<void> {
    return ipc.invoke(IpcMessages.close)
}

export async function request(
    ipc: IpcRenderer, rq: string
): Promise<ColumnValue[][]> {
    return ipc.invoke(IpcMessages.request, rq)
}