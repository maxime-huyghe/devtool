<template>
  <div id="app">
    <el-container>
      <el-col :span="6">
        <Tree class="left" :onElementClicked="onTreeElementClicked" />
      </el-col>
      <el-col :span="11">
        <Editor v-if="currentExampleId != null" v-model="currentExample" />
      </el-col>
      <el-col :span="7">
        <Database class="database" />
      </el-col>
    </el-container>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import HelloWorld from "./components/HelloWorld.vue";
import Tree from "./components/Tree.vue";
import Editor from "./components/Editor.vue";
import Database from "./components/Database.vue";
// import _ from "lodash";

export default Vue.extend({
  name: "App",
  components: {
    HelloWorld,
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
    currentExampleId: null as string | null
  }),

  methods: {
    onTreeElementClicked(id: string) {
      console.log(id);
      this.currentExampleId = id;

      if (this.examples[this.currentExampleId] == undefined) {
        this.examples[this.currentExampleId] = "";
      }
    }
  },

  computed: {
    currentExample: {
      get() {
        if (this.currentExampleId != null)
          return this.examples[this.currentExampleId];
      },
      set(newValue: string) {
        if (this.currentExampleId != null)
          this.examples[this.currentExampleId] = newValue;
      }
    }
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  /* color: #2c3e50; */
  /* margin-top: 60px; */
  /* display: flex; */
  /* flex-direction: row; */
  background: white;
  margin: 0px;
}
body {
  margin: 0px;
}
.hello {
  border: 1px black;
}
.database {
  height: 100vh;
}
</style>
