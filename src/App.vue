<template>
  <div id="app">
    <columns id="columns" :leftWidth="450" :rightWidth="600">
      <!-- Tree -->
      <div slot="left" class="col left" ref="left">
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
        />
      </div>

      <!-- Editor -->
      <Editor
        v-if="currentExampleId != null"
        :editId="currentExampleId"
        v-model="examples"
        @selection="(select) => editorSelection = select"
      />

      <!-- Database -->
      <div slot="right" class="col right" ref="right">
        <Database :selection="editorSelection" />
      </div>
    </columns>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Tree from "./components/Tree.vue";
import Editor from "./components/Editor.vue";
import Database from "./components/Database.vue";
import Columns from "./components/Columns.vue";
import { TreeData } from "element-ui/types/tree";
import { Dialog } from "electron";
// from preload.js
declare const dialog: Dialog;
import _fs from "fs";
// from preload.js (importing it here doesn't work)
declare const fs: typeof _fs;
// from preload.js
declare const PWD: string;

export default Vue.extend({
  name: "App",

  components: {
    Tree,
    Editor,
    Database,
    Columns
  },

  data: () => ({
    // The id of the example currently open in the editor.
    currentExampleId: null as string | null,
    // id -> example.
    examples: {} as Record<string, string>,
    // The elements in the menu on the left.
    treeElements: [] as TreeData[],

    // The currently opened file.
    fileName: "",

    // Whether the data was modified since the file was last loaded or saved.
    dirty: false,
    // If this is true, do not set dirty when the data is modified
    // because it means the modification comes from loading from disk.
    justCleaned: false,

    // The text that's selected in the editor.
    editorSelection: ""
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

    async save(fileName: string) {
      return await new Promise(resolve => {
        const file = fs.createWriteStream(fileName);
        file.write(
          JSON.stringify({
            tree: this.treeElements,
            examples: this.examples
          })
        );
        file.close();

        this.dirty = false;
        resolve();
      });
    },

    async saveAs() {
      const res = await dialog.showSaveDialog({
        title: "Sauvegarder",
        filters: [{ name: "Fichiers json", extensions: ["json"] }]
      });

      if (res.canceled) return;
      if (!res.filePath) return;

      this.fileName = res.filePath;
      await this.save(res.filePath);
    },

    async load() {
      const res = await dialog.showOpenDialog({
        title: "Charger",
        defaultPath: PWD
      });

      if (res.canceled) return;
      if (!res.filePaths[0]) return;

      // The file reading code is wrapped in a promise to avoid blocking, as Vue seems to dislike
      // slow click handlers.
      const loadFile: Promise<string> = new Promise((resolve, reject) => {
        const file = fs.createReadStream(res.filePaths[0]);
        let content = file.read();
        if (!content) {
          console.log("Retrying file read...");
          // This often fails the first time
          content = file.read();
          if (!content) {
            const error = `couldn't read file ${res.filePaths[0]}`;
            reject(error);
          }
        }
        resolve(content);
      });

      let fileContent: string;
      try {
        fileContent = await loadFile;
      } catch (error) {
        this.showError(error);
        throw error;
      }

      let parsed: any;
      let properties: string[];
      try {
        parsed = JSON.parse(fileContent.toString());
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
    }
  }
});
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
