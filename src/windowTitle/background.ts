import { MESSAGE } from './renderer'
import { IpcMain, ipcMain, BrowserWindow } from 'electron'

export function installWindowTitleCallback(ipcMain: IpcMain, win: BrowserWindow) {
    ipcMain.handle(MESSAGE, (_, newTitle: string) => {
        win.setTitle(newTitle)
    })
}
