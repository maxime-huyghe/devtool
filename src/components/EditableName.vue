<template>
  <span>
    <el-button class="edit-btn" size="mini" type="text" icon="el-icon-edit" @click="toggleEditing" />
    <el-input
      v-if="editing"
      size="mini"
      clearable
      @change="toggleEditing"
      @blur="toggleEditing"
      @input="update"
      :value="value"
      ref="input"
      placeholder="Entrez un nom"
    >
      <el-button slot="append" icon="el-icon-check" @click="toggleEditing" />
    </el-input>

    <span v-else @click="toggleEditing">{{value}}</span>
  </span>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "EditableName",
  props: {
    value: String
  },

  data: () => ({
    editing: true
  }),

  mounted() {
    (this.$refs.input as any)?.focus();
  },

  methods: {
    async toggleEditing() {
      this.editing = !this.editing;
      if (this.editing) {
        await Vue.nextTick();
        (this.$refs.input as any)?.focus();
      }
    },
    update(ev: string) {
      this.$emit("input", ev);
    }
  }
});
</script>