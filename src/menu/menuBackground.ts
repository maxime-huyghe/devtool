import { Menu, MenuItem, MenuItemConstructorOptions, WebContents } from 'electron'
import { MenuMessages } from './menu'

export function menu(webContents: WebContents): Menu {
    const template: (MenuItemConstructorOptions | MenuItem)[] = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => webContents.send(MenuMessages.New),
                },
                {
                    label: 'Open',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => webContents.send(MenuMessages.Open),
                },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => webContents.send(MenuMessages.Save),
                },
                {
                    label: 'Save as',
                    accelerator: 'CmdOrCtrl+Shift+S',
                    click: () => webContents.send(MenuMessages.SaveAs),
                },
                { role: 'quit' },
            ],
        },
        {
            role: 'editMenu',
        },
        { role: 'viewMenu' },
        { role: 'windowMenu' },
    ]

    return Menu.buildFromTemplate(template)
}
