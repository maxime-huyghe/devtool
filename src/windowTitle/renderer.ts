import { IpcRenderer } from 'electron'

export const MESSAGE = 'setWindowTitle'

export async function setWindowTitle(
    ipc: IpcRenderer,
    filename: string,
    dirty: boolean,
): Promise<void> {
    return ipc.invoke(MESSAGE, filename, dirty)
}
