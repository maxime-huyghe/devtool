import { IpcRenderer } from 'electron'
import { Credentials } from '../components/Database'
import { TreeData } from 'element-ui/types/tree'

export enum PersistenceMessages {
    Save = 'persistence_save',
    SaveString = 'persistence_save_string',
    Load = 'persistence_load',
}

export type SaveArgs = {
    filename: string
    credentials: Credentials
    treeElements: TreeData[]
    examples: Record<string, string>
}
export async function saveToFile(ipc: IpcRenderer, args: SaveArgs): Promise<void> {
    return ipc.invoke(PersistenceMessages.Save, args)
}

export type SaveStringArgs = {
    filename: string
    toBeSaved: string
}
export async function saveStringToFile(ipc: IpcRenderer, args: SaveStringArgs): Promise<void> {
    return ipc.invoke(PersistenceMessages.SaveString, args)
}

export type LoadRet = SaveArgs
export async function loadFromFile(ipc: IpcRenderer, filename: string): Promise<LoadRet> {
    return ipc.invoke(PersistenceMessages.Load, filename)
}
