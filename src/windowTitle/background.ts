import { MESSAGE } from './renderer'
import { IpcMain, ipcMain, BrowserWindow } from 'electron'

export function installWindowTitleCallback(ipcMain: IpcMain, win: BrowserWindow) {
    ipcMain.handle(MESSAGE, (_, filename: string, dirty: boolean) => {
        win.setTitle(`${dirty ? '* ' : ''}${filename !== '' ? `${filename} - ` : ''}devtool`)
    })
}
