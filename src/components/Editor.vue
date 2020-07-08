<template>
    <div id="parent">
        <div id="settings">
            <el-select v-model="selectedLanguage" filterable placeholder="Langage">
                <el-option
                    v-for="lang in languages"
                    :key="lang.display"
                    :label="lang.display"
                    :value="lang.name"
                />
            </el-select>
            <el-select v-model="selectedTheme" filterable placeholder="Theme">
                <el-option v-for="t in themes" :label="t.display" :key="t.name" :value="t.name" />
            </el-select>
        </div>
        <div id="editor" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Ace from 'ace-builds'
import { editorModes } from './editorModes'
require('ace-builds/webpack-resolver')

const event = 'change'

export default Vue.extend({
    name: 'Editor',

    props: {
        // Session->text mapping.
        contents: Object,
        // Current session's id. Must be one of contents' keys.
        editId: String,
    },

    data: () => {
        // List here: https://github.com/ajaxorg/ace/blob/master/lib/ace/ext/modelist.js#L53
        const languages = editorModes
        const themes = [
            {
                name: 'dracula',
                display: 'Dracula',
            },
            {
                name: 'solarized_dark',
                display: 'Solarized Dark',
            },
            {
                name: 'solarized_light',
                display: 'Solarized Light',
            },
            {
                name: 'textmate',
                display: 'Textmate',
            },
        ]
        return {
            editor: null as ReturnType<typeof Ace.edit> | null,
            languages,
            selectedLanguage: languages[0].name,
            themes,
            selectedTheme: themes[0].name,
        }
    },

    computed: {
        // The text currently being edited
        edited: {
            get() {
                return this.contents[this.editId]
            },
            set(newValue: string) {
                this.contents[this.editId] = newValue
            },
        },
    },

    model: {
        prop: 'contents',
        event: event,
    },

    mounted() {
        this.editor = Ace.edit('editor') // HTML element with id `editor`
        this.editor.session.setMode(`ace/mode/${this.selectedLanguage}`)
        this.editor.setTheme('ace/theme/dracula')
        this.editor.setValue(this.edited)

        this.editor.on('change', () => {
            if (!this.editor) return
            const value = this.editor.getValue()
            this.edited = value
            this.$emit(event, this.contents)
        })

        this.editor.selection.on('changeSelection', () => {
            if (!this.editor) return
            let text = this.editor.getSelectedText()
            this.$emit('selection', text)
        })
    },

    methods: {
        onInput(ev: Event) {
            this.$emit('input', (ev.target as any).value)
        },
    },

    watch: {
        editId(newValue) {
            if (!this.editor) return
            this.editor.setValue(this.edited)
            this.editor.gotoLine(0, 0, false)
            this.editor.focus()
        },

        selectedLanguage(newLang) {
            this.editor?.session.setMode(`ace/mode/${newLang}`)
        },

        selectedTheme(newTheme) {
            this.editor?.setTheme(`ace/theme/${newTheme}`)
        },
    },
})
</script>

<style scoped>
#parent {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

#editor {
    width: 100%;
    height: 100%;
}
</style>
