<template>
  <div class="parent">
    <div id="editor"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Ace, { edit } from "ace-builds";
require("ace-builds/webpack-resolver");

const event = "change";

export default Vue.extend({
  name: "Editor",

  data: () => ({
    editor: null as ReturnType<typeof edit> | null
  }),

  props: {
    // Session->text mapping.
    contents: Object,
    // Current session's id. Must be one of contents' keys.
    editId: String
  },

  model: {
    prop: "contents",
    event: event
  },

  mounted() {
    this.editor = Ace.edit("editor");
    this.editor.session.setMode("ace/mode/javascript");
    console.log(this.contents);
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
    }
  },

  computed: {
    edited: {
      get() {
        return this.contents[this.editId];
      },
      set(newValue: string) {
        this.contents[this.editId] = newValue;
      }
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
