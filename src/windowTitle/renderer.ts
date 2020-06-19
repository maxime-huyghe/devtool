import { IpcRenderer } from 'electron'

export const MESSAGE = 'setWindowTitle'

export async function setWindowTitle(ipc: IpcRenderer, title: string): Promise<void> {
    return ipc.invoke(MESSAGE, title)
}
