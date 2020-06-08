<template>
  <div class="hello">
    <el-row type="flex" :gutter="10">
      <el-col :span="6">
        <el-button icon="el-icon-upload2" type="primary">Charger</el-button>
      </el-col>
      <el-col>
        <el-button icon="el-icon-download" type="primary">Sauvegarder</el-button>
      </el-col>
    </el-row>
    <el-row type="flex" :gutter="10">
      <el-col :span="10"></el-col>
    </el-row>

    <template v-if="elements.length > 0">
      <el-tree
        :data="elements"
        @node-click="onNodeClick"
        node-key="id"
        :expand-on-click-node="false"
        :default-expand-all="true"
      >
        <span class="tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span>
            <template v-if="!data.isLeaf">
              <el-button
                type="text"
                icon="el-icon-folder-add"
                @click="(ev) => append(ev, data)"
              >Dossier</el-button>
              <el-button
                type="text"
                icon="el-icon-document-add"
                @click="(ev) => append(ev, data)"
              >Exemple</el-button>
            </template>
            <el-button type="text" icon="el-icon-delete" @click="() => remove(node, data)">Supprimer</el-button>
          </span>
        </span>
      </el-tree>
    </template>
    <el-button icon="el-icon-plus" @click="newExemple">Nouveau</el-button>

    <h1>{{ msg }}</h1>
    <button @click="log">test</button>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { TreeNode, TreeData } from "element-ui/types/tree";

let id = 0;

export default Vue.extend({
  name: "Tree",
  props: {
    msg: String
  },
  methods: {
    log() {
      console.log(this.msg);
    },

    save() {
      console.log("save");
    },

    load() {
      console.log("load");
    },

    newExemple() {
      console.log("newExemple");
      this.elements.push({
        label: "test",
        children: []
      } as any);
    },

    append(ev: Event, data: any) {
      if (ev) {
        ev.preventDefault();
      }
      const newChild = { id: id++, label: "testtest", children: [] };
      if (!data.children) {
        this.$set(data, "children", []);
      }
      data.children.push(newChild);
    },

    newFolder() {},

    // three parameters: node object corresponding to the node clicked, node property of TreeNode, TreeNode itself
    onNodeClick(
      nodeData: TreeData,
      node: TreeNode<string, TreeData>,
      component: any
    ) {
      console.log("node clicked");
      console.log(nodeData);
      console.log(node);
      console.log(component);
    }
  },

  data: () => ({
    elements: [] as {}[],
    defaultProps: {
      children: "children",
      label: "label"
    }
  })
});
</script>

<style scoped>
.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>