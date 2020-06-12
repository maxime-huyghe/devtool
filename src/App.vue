<template>
  <div id="app">
    <!-- Tree -->
    <span class="col left">
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

let a = "";

export default Vue.extend({
  name: "App",

  components: {
    Tree,
    Editor,
    Database
  },

  data: () => ({
    examples: {
      "0": `function foo(items) {
  var x = "All this is syntax highlighted";
  return x;
}`
    } as Record<string, string>,
    currentExampleId: null as string | null,
    treeElements: [] as TreeData[],
    editorSelection: "",
    databaseExpanded: false
  }),

  methods: {
    onTreeElementClicked(id: string) {
      this.currentExampleId = id;

      if (this.examples[this.currentExampleId] == undefined) {
        this.examples[this.currentExampleId] = "";
      }
    },

    save() {
      a = JSON.stringify({
        tree: this.treeElements,
        examples: this.examples
      });
    },

    load() {
      console.log(a);
      let parsed = JSON.parse(a);
      let properties = Object.getOwnPropertyNames(parsed);

      if (!properties.includes("tree") || !properties.includes("examples"))
        throw "invalid file format";

      let hasKeys = parsed as { tree: any; examples: any };

      if (!Array.isArray(hasKeys.tree) || typeof hasKeys.examples != "object")
        throw "invalid file format";

      this.treeElements = hasKeys.tree;
      this.examples = hasKeys.examples;
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
.left {
  width: 24vw;
}
#expand {
  height: 100vh;
  width: 1vw;
}
.left,
.right {
  height: 96vh;
  margin: 2vh;
}
</style>
