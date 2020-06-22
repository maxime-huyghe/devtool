import Vue from 'vue'
import Vuex from 'vuex'
import { AutoSaveArgs } from '../autosave'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        autoSaveArgs: {} as AutoSaveArgs,
    },
    mutations: {
        autoSave(state, args: AutoSaveArgs) {
            state.autoSaveArgs = args
        },
    },
    actions: {},
    modules: {},
})
