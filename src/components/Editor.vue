<template>
  <div class="hello">
    <div class="container">
      <textarea
        type="textarea"
        autosize
        placeholder="allo"
        :value="value"
        @input="$emit('input', $event.target.value)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Editor",
  data: () => ({}),
  props: {
    text: String,
    value: String
  }
});
</script>

<style scoped>
.container {
  height: 100vh;
  overflow: auto;
}
textarea {
  width: 98%;
  height: 98%;
  margin: auto;
  resize: none;
}
</style>
