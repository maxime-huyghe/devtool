import { IpcRenderer } from 'electron'
import { Credentials } from '../components/Database'
import { TreeData } from 'element-ui/types/tree'

export enum PersistenceMessages {
    Save = 'persistence_save',
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

export type LoadRet = SaveArgs
export async function loadFromFile(ipc: IpcRenderer, filename: string): Promise<LoadRet> {
    return ipc.invoke(PersistenceMessages.Load, filename)
}
