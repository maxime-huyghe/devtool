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
// k == kind
export type InstanceOrPort =
    | { k: 'instance', instanceName: string }
    | { k: 'port', port: number }

export const AUTH_TYPES: AuthType['k'][] = [
    'default', 'ntlm'
    // , 'azure-active-directory-password', 'azure-active-directory-access-token'
    // , 'azure-active-directory-msi-vm', 'azure-active-directory-msi-app-service'
]

export type AuthType =
    | { k: 'default' }
    | { k: 'ntlm', domain: string }
// Not using Azure
// | { kind: 'azure-active-directory-password' }
// | { kind: 'azure-active-directory-access-token' }
// | { kind: 'azure-active-directory-msi-vm' }
// | { kind: 'azure-active-directory-msi-app-service' }

/** Functions implemented in databaseBackground.ts */

/** To keep the arguments in sync between the different parts of the app */
export type ConnectArgs = {
    server: string, instanceOrPort: InstanceOrPort, userName: string, password: string,
    database: string, encrypt: boolean, useTLSv1: boolean, authType: AuthType
}
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

export function toCsv<T extends string>(columnNames: T[], rows: Record<T, string>[]): string {
    let csv = ""
    csv = columnNames.map(csvEscape).join(";")

    for (const row of rows) {
        let values: string[] = []
        for (const colName of columnNames) {
            values.push(csvEscape(row[colName]))
        }
        csv += "\n" + values.join(";")
    }

    return csv
}

function csvEscape(input: string): string {
    input = String(input)

    const mustBeEscaped = input.includes('"') || input.includes(';')
    if (mustBeEscaped) {
        const escaped = input.replace('"', '""')
        return `"${escaped}"`
    }

    return input
}
