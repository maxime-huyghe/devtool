import Vue from 'vue'
import App from './App.vue'
import store from './store'
import 'element-ui/lib/theme-chalk/index.css';
import Element from "element-ui";

Vue.config.productionTip = false

Vue.use(Element)

let app = new Vue({
    render: h => h(App),
    store,
    el: '#app'
})

// const electron = window.require('electron')
// const ipcRenderer = electron.ipcRenderer
// import electron from 'electron';
import { ipcRenderer } from "electron";

ipcRenderer.on('asynchronous-reply', (ev, arg) => {
    console.log(arg)
})

ipcRenderer.send('asynchronous-message', 'ping')

// TODO copier coller dant dt
