<template>
  <div class="parent">
    <div id="editor"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Ace, { edit } from "ace-builds";
require("ace-builds/webpack-resolver");

const event = "input";

export default Vue.extend({
  // TODO: passer un Record<string, string> des contenus en v-model ainsi que l'id actuel en prop.
  // Comme ça, si l'id change, c'est un changement externe, et plus aucun pb.
  // Éventuellement maintenir une liste de sessions ?
  name: "Editor",

  data: () => ({
    editor: null as ReturnType<typeof edit> | null
  }),

  props: {
    value: String
  },

  model: {
    prop: "value",
    event: event
  },

  mounted() {
    this.editor = Ace.edit("editor");
    this.editor.session.setMode("ace/mode/javascript");
    console.log(this.value);
    this.editor.setValue(String(this.value));

    this.editor.on("change", () => {
      if (!this.editor) return;
      this.$emit(event, this.editor.getValue());
    });
  },

  methods: {
    onInput(ev: Event) {
      this.$emit("input", (ev.target as any).value);
    }
  },

  watch: {
    value(newValue, oldValue) {
      if (!this.editor) return;
      // This means the new value comes from a parent component.
      // TODO: very inefficient.
      if (newValue != this.editor.getValue()) {
        this.editor.setValue(String(newValue));
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
