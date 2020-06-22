import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { PersistenceMessages, SaveArgs, LoadRet } from './renderer'
import { createWriteStream, createReadStream, readFile } from 'fs'
/** Everything needed to save/load a file to/from disk */

export function installPersistenceCallbacks() {
    ipcMain.handle(PersistenceMessages.Save, (_: IpcMainInvokeEvent, args: SaveArgs): void => {
        const passwordLess = { ...args.credentials }
        passwordLess.password = ''

        const file = createWriteStream(args.filename)
        file.write(
            JSON.stringify({
                treeElements: args.treeElements,
                examples: args.examples,
                credentials: passwordLess,
            }),
        )
        file.close()
    })

    ipcMain.handle(
        PersistenceMessages.Load,
        async (_: IpcMainInvokeEvent, filename: string): Promise<LoadRet> => {
            const fileContent: string = await new Promise((resolve, reject) => {
                readFile(filename, 'utf8', (err, data) => {
                    if (err) reject(err)
                    resolve(data)
                })
            })

            let parsed: any
            let properties: string[]
            try {
                parsed = JSON.parse(fileContent)
                properties = Object.getOwnPropertyNames(parsed)
            } catch (error) {
                throw new Error(`not valid json: ${error.toString()}`)
            }

            const requiredProperties = ['treeElements', 'examples', 'credentials']
            const missingProperties = requiredProperties.filter(rp => !properties.includes(rp))
            if (missingProperties.length > 0) {
                throw new Error(`file lacks fields ${missingProperties.join(', ')}.`)
            }

            const hasKeys = parsed as { treeElements: any; examples: any; credentials: any }

            if (
                !Array.isArray(hasKeys.treeElements) ||
                typeof hasKeys.examples !== 'object' ||
                typeof hasKeys.credentials !== 'object'
            ) {
                throw new Error(
                    '`treeElements` should be an array, `examples` and `credentials` objects',
                )
            }

            return {
                filename,
                ...hasKeys,
            }
        },
    )
}
