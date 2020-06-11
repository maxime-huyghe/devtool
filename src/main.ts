import Vue from 'vue'
import App from './App.vue'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css'
import Element from "element-ui"
import { connect, request, close } from './database/databaseRenderer'
import { IpcRenderer } from 'electron';
// `ipcRenderer` is added to the `window` object in preload.js
export declare var ipcRenderer: IpcRenderer;


Vue.config.productionTip = false

Vue.use(Element)

let app = new Vue({
    render: h => h(App),
    store,
    el: '#app'
})

let main = async () => {
    try {
        await connect(ipcRenderer, 'localhost', 'SA', 'P@55w0rd123')
        await request(ipcRenderer, 'use test')
        let resp = await request(ipcRenderer, 'select * from test')
        console.dir(resp.map(row => row.map(col => col.value)))
        await close(ipcRenderer)
    } catch (err) {
        console.error(err)
    }
}
main()