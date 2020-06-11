import { Connection, Request, ConnectionConfig, ColumnValue } from "tedious";
import { ipcMain } from "electron";

export enum messages {
    connect = 'connect',
    disconnect = 'disconnect',
    request = 'request'
}

let connection: Connection | null;

ipcMain.on(messages.connect, (event, url, username, password) => {
    let config: ConnectionConfig = {
        server: url,
        authentication: {
            type: 'default',
            options: {
                userName: username,
                password: password,
            },
        },
        options: {
            database: 'test',
            trustServerCertificate: true,
            rowCollectionOnRequestCompletion: true,
        },
    }

    connection = new Connection(config)

    connection.on('connect', async (err) => {
        if (err) {
            console.log(err)
            event.reply(false)
        } else {
            console.log('Connected')
            event.reply(true)
        }
    })
})

// try {
//     let rows = await executeSql(connection, 'select * from test')
//     rows.forEach((columns) => columns.forEach((col) => console.log(col.value)))
// } catch (error) {
//     console.log(error)
// }


// async function executeSql(cn: Connection, query: string): Promise<ColumnValue[][]> {
//     return new Promise((resolve, reject) => {
//         let request = new Request(query, async (err, _rowCount, rows) => {
//             if (err) {
//                 reject(err);
//             }

//             resolve(rows as ColumnValue[][])
//         });

//         connection.execSql(request);
//     })
// }
