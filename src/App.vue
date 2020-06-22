<template>
    <div id="app">
        <columns id="columns" :leftWidth="450" :rightWidth="600">
            <!-- Tree -->
            <div slot="left" class="col left" ref="left">
                <Tree
                    :onElementClicked="onTreeElementClicked"
                    :elements="treeElements"
                    :onElementsChange="newElts => (treeElements = newElts)"
                />
            </div>

            <!-- Editor -->
            <Editor
                v-if="currentExampleId != null"
                :editId="currentExampleId"
                v-model="examples"
                @selection="select => (editorSelection = select)"
            />

            <!-- Database -->
            <div slot="right" class="col right" ref="right">
                <Database :selection="editorSelection" v-model="credentials" />
            </div>
        </columns>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Tree from './components/Tree.vue'
import Editor from './components/Editor.vue'
import Database from './components/Database.vue'
import { Credentials } from './components/Database'
import Columns from './components/Columns.vue'
import { TreeData } from 'element-ui/types/tree'
import { Dialog } from 'electron'
import { IpcRenderer } from 'electron'
import _fs from 'fs'
import { MenuMessages } from './menu/renderer'
import { setWindowTitle } from './windowTitle/renderer'
import { saveToFile, loadFromFile } from './persistence/renderer'

// from preload.js
declare const dialog: Dialog
// from preload.js (importing it here directly doesn't work, but we need its type)
declare const fs: typeof _fs
// from preload.js
declare const PWD: string
// from preload.js
declare const ipcRenderer: IpcRenderer

const localStorageLastFileKey = 'lastFile'

const defaultCredentials: Credentials = {
    server: '',
    port: '1433',
    instance: '',
    domain: '',
    userName: '',
    password: '',
    database: '',
    useInstanceName: true,
    useTLSv1: true,
    useNTLM: true,
    encrypt: true,
}

export default Vue.extend({
    name: 'App',

    components: {
        Tree,
        Editor,
        Database,
        Columns,
    },

    data: () => ({
        // The id of the example currently open in the editor.
        currentExampleId: null as string | null,
        // id -> example.
        examples: {} as Record<string, string>,
        // The elements in the menu on the left.
        treeElements: [] as TreeData[],

        // The currently opened file.
        fileName: '',

        // Whether the data was modified since the file was last loaded or saved.
        dirty: false,

        // The text that's selected in the editor.
        editorSelection: '',

        // The database connections credentials
        credentials: { ...defaultCredentials }, // shallow clone
    }),

    async mounted() {
        const lastFile = localStorage.getItem(localStorageLastFileKey)
        if (lastFile) {
            this.load(lastFile)
        }

        ipcRenderer
            .on(MenuMessages.New, async () => await this.newFile())
            .on(MenuMessages.Open, async () => await this.loadDialog())
            .on(MenuMessages.Save, async () =>
                this.fileName !== '' ? await this.save(this.fileName) : await this.saveDialog(),
            )
            .on(MenuMessages.SaveAs, async () => await this.saveDialog())
    },

    async beforeDestroy() {},

    destroyed() {
        // If we don't do this, the listeners will be registered several times if the app is reloaded
        ipcRenderer
            .removeAllListeners(MenuMessages.New)
            .removeAllListeners(MenuMessages.Open)
            .removeAllListeners(MenuMessages.Save)
            .removeAllListeners(MenuMessages.SaveAs)
    },

    watch: {
        treeElements: {
            handler() {
                this.makeDirty()
            },
            deep: true,
        },
        examples: {
            handler() {
                this.makeDirty()
            },
            deep: true,
        },
        credentials: {
            handler() {
                this.makeDirty()
            },
            deep: true,
        },
        dirty(newDirtyness: boolean) {
            this.updateTitle(this.fileName, newDirtyness)
        },
        fileName(newFileName: string) {
            this.updateTitle(newFileName, this.dirty)
            if (newFileName !== '') localStorage.setItem(localStorageLastFileKey, this.fileName)
        },
    },

    methods: {
        makeDirty() {
            this.dirty = true
        },

        updateTitle(filename: string, dirty: boolean) {
            const fn = filename
                .split('/')
                .pop()
                ?.split('\\')
                .pop() as string
            setWindowTitle(ipcRenderer, fn, dirty)
        },

        showError(error: string) {
            // This is ElementUI's popup system
            this.$message({
                showClose: true,
                message: error,
                type: 'error',
                duration: 0,
            })
        },

        onTreeElementClicked(id: string) {
            this.currentExampleId = id

            if (this.examples[this.currentExampleId] == undefined) {
                this.examples[this.currentExampleId] = ''
            }
        },

        async newFile() {
            this.currentExampleId = null
            this.examples = {}
            this.treeElements = []
            this.fileName = ''
            this.dirty = true
            this.editorSelection = ''
            this.credentials = defaultCredentials
        },

        async saveDialog() {
            const res = await dialog.showSaveDialog({
                title: 'Sauvegarder',
                filters: [{ name: 'Fichiers json', extensions: ['json'] }],
            })

            if (res.canceled) return
            if (!res.filePath) return

            this.fileName = res.filePath
            await this.save(res.filePath)
        },

        async save(fileName: string) {
            saveToFile(ipcRenderer, {
                filename: this.fileName,
                credentials: this.credentials,
                treeElements: this.treeElements,
                examples: this.examples,
            })

            this.dirty = false
        },

        async loadDialog() {
            const res = await dialog.showOpenDialog({
                title: 'Charger',
                defaultPath: PWD,
            })

            if (res.canceled) return
            if (!res.filePaths[0]) return

            this.load(res.filePaths[0])
        },

        async load(file: string) {
            try {
                const { filename, treeElements, examples, credentials } = await loadFromFile(
                    ipcRenderer,
                    file,
                )

                this.fileName = filename
                this.treeElements = treeElements
                this.examples = examples
                this.credentials = credentials

                await Vue.nextTick()
                // Waiting for the next tick because changing treeElements, examples, etc
                // will automatically set dirty : we want to unset it after.
                this.dirty = false
            } catch (error) {
                this.showError(error)
                throw error
            }
        },
    },
})
</script>

<style>
body {
    margin: 0px;
}

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: white;
    margin: 0px;
}

#columns {
    height: 100vh;
}

.col.right {
    height: 100%;
}
</style>
