<template>
  <div class="parent">
    <el-select v-model="selectedLanguage" filterable placeholder="Langage">
      <el-option
        v-for="lang in languages"
        :key="lang.display"
        :label="lang.display"
        :value="lang.name"
      />
    </el-select>
    <div id="editor"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Ace from "ace-builds";
import { editorModes } from "./editorModes";
require("ace-builds/webpack-resolver");

const event = "change";

export default Vue.extend({
  name: "Editor",

  props: {
    // Session->text mapping.
    contents: Object,
    // Current session's id. Must be one of contents' keys.
    editId: String
  },

  data: () => {
    // List here: https://github.com/ajaxorg/ace/blob/master/lib/ace/ext/modelist.js#L53
    const languages = editorModes;
    return {
      editor: null as ReturnType<typeof Ace.edit> | null,
      languages,
      selectedLanguage: languages[0].name
    };
  },

  computed: {
    // The text currently being edited
    edited: {
      get() {
        return this.contents[this.editId];
      },
      set(newValue: string) {
        this.contents[this.editId] = newValue;
      }
    }
  },

  model: {
    prop: "contents",
    event: event
  },

  mounted() {
    this.editor = Ace.edit("editor"); // HTML element with id `editor`
    this.editor.session.setMode(`ace/mode/${this.selectedLanguage}`);
    this.editor.setValue(this.edited);

    this.editor.on("change", () => {
      if (!this.editor) return;
      const value = this.editor.getValue();
      this.edited = value;
      this.$emit(event, this.contents);
    });

    this.editor.selection.on("changeSelection", () => {
      if (!this.editor) return;
      let text = this.editor.getSelectedText();
      this.$emit("selection", text);
    });
  },

  methods: {
    onInput(ev: Event) {
      this.$emit("input", (ev.target as any).value);
    }
  },

  watch: {
    editId(newValue) {
      if (!this.editor) return;
      this.editor.setValue(this.edited);
      this.editor.gotoLine(0, 0, false);
      this.editor.focus();
    },

    selectedLanguage(newLang) {
      this.editor?.session.setMode(`ace/mode/${newLang}`);
    }
  }
});
</script>

<style scoped>
.container {
  height: 100vh;
  overflow: auto;
}

.parent {
  width: 100%;
  height: 100%;
}

#editor {
  width: 100%;
  height: 100%;
}
</style>
