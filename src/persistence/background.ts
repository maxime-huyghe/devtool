import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { PersistenceMessages, SaveArgs, LoadRet, SaveStringArgs } from './renderer'
import { readFile, writeFile } from 'fs'
/** Everything needed to save/load a file to/from disk */

export function installPersistenceCallbacks() {
    ipcMain.handle(
        PersistenceMessages.Save,
        async (_: IpcMainInvokeEvent, args: SaveArgs): Promise<void> => {
            const passwordLess = { ...args.credentials }
            passwordLess.password = ''

            let content = JSON.stringify({
                treeElements: args.treeElements,
                examples: args.examples,
                credentials: passwordLess,
            })

            return new Promise((resolve, reject) => {
                writeFile(args.filename, content, err => {
                    err ? reject(err) : resolve()
                })
            })
        },
    )

    ipcMain.handle(
        PersistenceMessages.SaveString,
        async (_: IpcMainInvokeEvent, args: SaveStringArgs): Promise<void> => {
            return new Promise((resolve, reject) => {
                writeFile(args.filename, args.string, err => {
                    err ? reject(err) : resolve()
                })
            })
        },
    )

    ipcMain.handle(
        PersistenceMessages.Load,
        async (_: IpcMainInvokeEvent, filename: string): Promise<LoadRet> => {
            const fileContent: string = await new Promise((resolve, reject) => {
                readFile(filename, 'utf8', (err, data) => {
                    err ? reject(err) : resolve(data)
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
