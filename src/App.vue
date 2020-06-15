<template>
  <div id="app">
    <!-- Tree -->
    <span class="col left">
      <el-form>
        <el-form-item>
          <!-- Broken for some reason -->
          <el-button
            @click="save(fileName)"
            :disabled="!dirty || fileName == null"
            icon="el-icon-download"
            type="primary"
          >Sauvegarder {{ fileName ? fileName.split('/').pop() : '' }}</el-button>
          <el-button @click="saveAs" icon="el-icon-download" type="primary">Sauvegarder sous</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="load" icon="el-icon-upload2" type="primary">Charger</el-button>
        </el-form-item>
      </el-form>

      <Tree
        :onElementClicked="onTreeElementClicked"
        :elements="treeElements"
        :onElementsChange="(newElts) => treeElements = newElts"
        :onSave="save"
        :onLoad="load"
      />
    </span>

    <!-- Editor -->
    <span class="col mid" :style="editorStyle">
      <Editor
        v-if="currentExampleId != null"
        :editId="currentExampleId"
        v-model="examples"
        @selection="(select) => editorSelection = select"
      />
    </span>

    <!-- Expand database button -->
    <el-button
      @click="databaseExpanded = !databaseExpanded"
      :icon="databaseExpanded ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"
      type="text"
      id="expand"
    ></el-button>

    <!-- Database -->
    <span class="col right" :style="databaseStyle">
      <Database :selection="editorSelection" />
    </span>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Tree from "./components/Tree.vue";
import Editor from "./components/Editor.vue";
import Database from "./components/Database.vue";
import { TreeData } from "element-ui/types/tree";
import { Dialog } from "electron";
// from preload.js
declare const dialog: Dialog;
import _fs from "fs";
// from preload.js (importing it here doesn't work)
declare const fs: typeof _fs;

export default Vue.extend({
  name: "App",

  components: {
    Tree,
    Editor,
    Database
  },

  data: () => ({
    // The id of the example currently open in the editor
    currentExampleId: null as string | null,
    // id -> example
    examples: {} as Record<string, string>,
    // The elements in the menu on the left
    treeElements: [] as TreeData[],

    // The currently opened file
    fileName: "",

    // Whether the data was modified since the file was last loaded or saved
    dirty: false,
    // If this is true, do not set dirty when the data is modified
    // because it means the modification comes from loading from disk.
    justCleaned: false,

    // The text that's selected in the editor
    editorSelection: "",

    // Whether the database pane should be expanded
    databaseExpanded: false
  }),

  watch: {
    treeElements() {
      if (!this.justCleaned) this.dirty = true;
      this.justCleaned = false;
    },
    examples() {
      if (!this.justCleaned) this.dirty = true;
      this.justCleaned = false;
    }
  },

  methods: {
    showError(error: string) {
      // This is ElementUI's popup system
      this.$message({
        showClose: true,
        message: error,
        type: "error",
        duration: 0
      });
    },

    onTreeElementClicked(id: string) {
      this.currentExampleId = id;

      if (this.examples[this.currentExampleId] == undefined) {
        this.examples[this.currentExampleId] = "";
      }
    },

    save(fileName: string) {
      const file = fs.createWriteStream(fileName);
      file.write(
        JSON.stringify({
          tree: this.treeElements,
          examples: this.examples
        })
      );
      file.close();

      this.dirty = false;
    },

    async saveAs() {
      const res = await dialog.showSaveDialog({
        title: "Sauvegarder",
        filters: [{ name: "Fichiers json", extensions: ["json"] }]
      });

      if (res.canceled) return;
      if (!res.filePath) return;

      this.fileName = res.filePath;
      this.save(res.filePath);
    },

    async load() {
      const res = await dialog.showOpenDialog({
        title: "Charger"
      });

      if (res.canceled) return;
      if (!res.filePaths[0]) return;

      const file = fs.createReadStream(res.filePaths[0]);
      let content = file.read();
      if (!content) {
        console.log("Retrying file read...");
        // This often fails the first time
        content = file.read();
        if (!content) {
          const error = `couldn't read file ${res.filePaths[0]}`;
          this.showError(error);
          throw error;
        }
      }

      let parsed: any;
      let properties: string[];
      try {
        parsed = JSON.parse(content.toString());
        properties = Object.getOwnPropertyNames(parsed);
      } catch (error) {
        const err = `not valid json: ${error.toString()}`;
        this.showError(err);
        throw err;
      }

      if (!properties.includes("tree") || !properties.includes("examples")) {
        const error = "file lacks `tree` and/or `examples` fields";
        this.showError(error);
        throw error;
      }

      const hasKeys = parsed as { tree: any; examples: any };

      if (!Array.isArray(hasKeys.tree) || typeof hasKeys.examples != "object") {
        const error = "`tree` should be an array and examples an object";
        this.showError(error);
        throw error;
      }

      this.fileName = res.filePaths[0];
      this.dirty = false;
      this.justCleaned = true;
      this.treeElements = hasKeys.tree;
      this.examples = hasKeys.examples;
      console.log(this.treeElements);
    }
  },

  computed: {
    editorStyle() {
      let width = this.databaseExpanded ? "33vw" : "42vw";
      return { width: width };
    },
    databaseStyle() {
      let width = this.databaseExpanded ? "42vw" : "33vw";
      return { width: width };
    }
  }
});
</script>

<style>
/* Width */
.left {
  width: 24vw;
}
#expand {
  height: 100vh;
  width: 1vw;
}
/* Height */
#expand {
  height: 100vh;
}
.left,
.right {
  height: 96vh;
  margin: 2vh;
}
/* General */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: row;
  background: white;
  margin: 0px;
}
body {
  margin: 0px;
}
</style>
