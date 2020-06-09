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

    <el-button type="text" icon="el-icon-plus" @click="newNode">Nouveau</el-button>
    <template v-if="elements.length > 0">
      <el-tree
        :data="elements"
        @node-click="onNodeClick"
        node-key="id"
        :expand-on-click-node="false"
        :default-expand-all="true"
      >
        <div class="tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="(ev) => showRenameDialog(ev, data)"
            >Renommer</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-plus"
              @click="(ev) => addNode(ev, data)"
            >Nouveau</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              @click="(ev) => removeNode(ev, node)"
            >Supprimer</el-button>
          </span>
        </div>
      </el-tree>
    </template>

    <h1>{{ msg }}</h1>
    <button @click="log">test</button>

    <!-- Rename dialog -->
    <!-- <el-button type="text" @click="showDialog">open a Form nested Dialog</el-button> -->
    <el-dialog
      title="Shipping address"
      :visible.sync="renameDialog.visible"
      :before-close="onCloseRenameDialog"
    >
      <el-form label-width="120px">
        <el-form-item label="Nouveau nom">
          <el-input type="text" v-model="renameDialog.newLabel"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="onCloseRenameDialog">Cancel</el-button>
        <el-button type="primary" @click="commitRename">Confirm</el-button>
      </span>
    </el-dialog>
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

  data: () => ({
    elements: [] as TreeData[],
    renameDialog: { newLabel: "", id: null, visible: false } as {
      id: string | null;
      newLabel: string;
      visible: boolean;
    }
  }),

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

    newNode() {
      this.elements.push({
        label: "test",
        children: [],
        id: id++
      });
    },

    addNode(ev: Event, data: TreeData) {
      if (ev) {
        ev.preventDefault();
      }

      const newChild = { id: id++, label: "testtest", children: [] };
      if (!data.children) {
        // this.$set(data, "children", []);
        data.children = [];
      }
      data.children?.push(newChild);
    },

    removeNode(ev: Event, node: TreeNode<string, TreeData>) {
      console.log("remove");

      if (ev) {
        ev.preventDefault();
      }

      this.elements = this.elements
        .map(tree =>
          this.treeFilter(tree, treeElt => treeElt.id != node.data.id)
        )
        .filter(tree => tree != null) as TreeData[];
    },

    onNodeClick(
      nodeData: TreeData,
      node: TreeNode<string, TreeData>,
      component: any
    ) {
      // console.log("node clicked");
      // console.log(nodeData);
      // console.log(node);
      // console.log(component);
    },

    showRenameDialog(ev: Event, data: TreeData) {
      console.log("show");
      if (ev) ev.preventDefault();

      this.renameDialog.id = data.id;
      if (data.label) this.renameDialog.newLabel = data.label;
      console.log(this.renameDialog.id);
      this.renameDialog.visible = true;
    },

    onCloseRenameDialog() {
      this.renameDialog = { newLabel: "", id: null, visible: false };
      console.log("close");
    },

    commitRename(ev: Event) {
      console.log("rename");
      if (ev) {
        ev.preventDefault();
      }

      if (this.renameDialog.id == null) {
        console.log("rename dialog state id should not be null!");
        return;
      }

      let dialog = this.renameDialog;
      try {
        // an exception is thrown in the loop to end it early. I'm ashamed.
        this.elements.forEach(el =>
          this.treeForeach(el, node => {
            if (node.id == dialog.id) {
              node.label = dialog.newLabel;
              throw "break";
            }
          })
        );
      } catch (error) {}

      this.renameDialog = { newLabel: "", id: null, visible: false };
      console.log("rename2");
    },

    /** Calls `fn` on each element in the tree */
    treeForeach(tree: TreeData, fn: (t: TreeData) => void) {
      fn(tree);
      tree.children?.forEach(child => this.treeForeach(child, fn));
    },

    /** Makes a new tree, filtering out the elements for which `fn` returns false and their children */
    treeFilter(tree: TreeData, fn: (t: TreeData) => boolean): TreeData | null {
      if (!fn(tree)) {
        return null;
      }
      return {
        ...tree,
        children: tree.children
          ?.map(child => this.treeFilter(child, fn))
          .filter(child => child != null) as undefined | TreeData[]
      };
      tree.children?.forEach(child => this.treeForeach(child, fn));
    }
  }
});
</script>

<style scoped>
.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px;
}
</style>