<template>
  <div id="app">
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" class="left" />
    <HelloWorld msg="Number 2" class="mid" />
    <HelloWorld msg="Number 3" class="right" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import HelloWorld from "./components/HelloWorld.vue";

export default Vue.extend({
  name: "App",
  components: {
    HelloWorld
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  display: flex;
  flex-direction: row;
}
</style>
