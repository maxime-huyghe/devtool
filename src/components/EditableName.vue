<template>
  <span @click="startEditing">
    <el-popover placement="top" trigger="manual" v-model="editing">
      <span slot="reference">
        <el-button v-if="value.length > 0" type="text" icon="el-icon-edit">{{value}}</el-button>
        <el-button v-else type="text" icon="el-icon-plus">nommer</el-button>
      </span>

      <el-input-group>
        <el-input
          size="mini"
          clearable
          @change="editing = false"
          @blur="editing = false"
          @input="update"
          :value="value"
          ref="input"
          placeholder="Entrez un nom"
        />
      </el-input-group>
    </el-popover>
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
    editing: false
  }),

  mounted() {
    (this.$refs.input as any)?.focus();
  },

  methods: {
    async startEditing(ev: Event) {
      ev.preventDefault();
      this.editing = true;
      await Vue.nextTick();
      (this.$refs.input as any)?.focus();
    },
    update(ev: string) {
      this.$emit("input", ev);
    }
  }
});
</script>
