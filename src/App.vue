<template>
  <div id="app">
    <el-container>
      <el-col :span="6">
        <Tree class="left" :onElementClicked="onElementClicked" />
      </el-col>
      <el-col :span="11">
        <Editor v-model="editorContent" />
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
    editorContent: ""
  }),

  watch: {
    editorContent: (newContent: any, oldContent: any) => {
      console.log(newContent);
    }
  },

  methods: {
    onElementClicked(id: string) {
      console.log(id);
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
