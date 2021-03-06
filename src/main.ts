import Vue from 'vue'
import App from './App.vue'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css'
import Element from 'element-ui'
import { close } from './database/renderer'
import { IpcRenderer } from 'electron'
import { saveToFile } from './persistence/renderer'
// `ipcRenderer` is added to the `window` object in preload.js
export declare const ipcRenderer: IpcRenderer

Vue.config.productionTip = false

Vue.use(Element)

let app = new Vue({
    render: h => h(App),
    store,
    el: '#app',
})

window.addEventListener('beforeunload', async (e: BeforeUnloadEvent) => {
    close(ipcRenderer)

    const args = store.state.autoSaveArgs

    if (args.save) await saveToFile(ipcRenderer, args.args)
})
