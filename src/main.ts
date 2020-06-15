import Vue from 'vue'
import App from './App.vue'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css'
import Element from "element-ui"
import { connect, request, close } from './database/databaseRenderer'
import { IpcRenderer } from 'electron';
// `ipcRenderer` is added to the `window` object in preload.js
export declare const ipcRenderer: IpcRenderer;


Vue.config.productionTip = false

Vue.use(Element)

let app = new Vue({
    render: h => h(App),
    store,
    el: '#app'
})

window.onbeforeunload = (e: BeforeUnloadEvent) => {
    close(ipcRenderer)
}
