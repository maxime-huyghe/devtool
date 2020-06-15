<template>
  <div id="app" @mousemove="(ev) => onMouseMove(ev)" @mouseup="onMouseUp">
    <!-- Tree -->
    <div class="col left" ref="left" :style="treeStyle">
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

    <div class="resize-handle" @mousedown="(ev) => onMouseDown(ev, 'left')">
      <div>
        <i class="el-icon-caret-right" />
        <br />
        <i class="el-icon-caret-left" />
      </div>
    </div>

    <!-- Editor -->
    <div class="col mid">
      <Editor
        v-if="currentExampleId != null"
        :editId="currentExampleId"
        v-model="examples"
        @selection="(select) => editorSelection = select"
      />
    </div>

    <div class="resize-handle" @mousedown="(ev) => onMouseDown(ev, 'right')">
      <div>
        <i class="el-icon-caret-right" />
        <br />
        <i class="el-icon-caret-left" />
      </div>
    </div>

    <!-- Database -->
    <div class="col right" ref="right" :style="databaseStyle">
      <Database :selection="editorSelection" />
    </div>
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
    editorSelection: "",

    // Whether the database pane should be expanded.
    databaseExpanded: false,

    // Whether a column is being dragged, and which one. This is set in the onMouse(Down|Move|Up) handlers.
    columnDragged: null as "left" | "right" | null,

    // The left and right columns' width in px.
    leftWidth: 450,
    rightWidth: 600
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
        title: "Charger"
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
    },

    // TODO: use direct DOM manipulation for column resizing ?

    // Attached to the resize handles: if the drag starts on them, the user wants to resize.
    onMouseDown(ev: MouseEvent, whichColumn: "right" | "left") {
      this.columnDragged = whichColumn;
    },

    // Due to how Vue handles events asynchronously, the mouse can leave the element before it has
    // reached the correct position and ruin our day. That's why this handler is attached to the
    // root. Potentially terrible for performance.
    onMouseMove(ev: MouseEvent) {
      if (!this.columnDragged) return;

      switch (this.columnDragged) {
        case "right":
          this.rightWidth -= ev.movementX;
          break;
        case "left":
          this.leftWidth += ev.movementX;
          break;
      }
    },

    // See onMouseMove
    onMouseUp() {
      this.columnDragged = null;
    }
  },

  computed: {
    treeStyle: function() {
      return { width: `${this.leftWidth}px` };
    },
    databaseStyle() {
      return { width: `${this.rightWidth}px` };
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
  display: flex;
  flex-direction: row;
  background: white;
  margin: 0px;
}

.col {
  border-left: 1px solid;
  border-right: 1px solid;
}
.mid {
  flex: 1;
}
.left,
.right {
  height: 98vh;
  padding-top: 1vh;
  padding-bottom: 1vh;
}
.left {
  padding-left: 1vw;
}
.right {
  padding-right: 1vw;
}

.resize-handle {
  margin: 0px;
  width: 1vw;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 100vh;
  user-select: none;
  cursor: col-resize;
}
</style>
