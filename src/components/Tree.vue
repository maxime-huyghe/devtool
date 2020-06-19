<template>
    <div class="hello">
        <el-button
            v-if="elements.length == 0"
            type="text"
            size="mini"
            icon="el-icon-plus"
            @click="newNode"
        >
            Nouveau
        </el-button>

        <el-tree
            v-else
            :data="elements"
            node-key="id"
            @node-click="onNodeClick"
            draggable
            :expand-on-click-node="false"
            default-expand-all
        >
            <!-- Tree node content -->
            <span class="tree-node" slot-scope="{ node, data }">
                <!-- Name -->
                <EditableName v-model="data.label" />

                <!-- Buttons -->
                <span>
                    <!-- Open -->
                    <el-button
                        type="text"
                        icon="el-icon-edit-outline"
                        @click="onNodeClick(data, node, undefined)"
                    />

                    <!-- Remove -->
                    <el-button
                        class="mr"
                        type="text"
                        icon="el-icon-delete"
                        @click="ev => removeNode(ev, node)"
                    />

                    <!-- New -->
                    <el-popover placement="right" trigger="hover">
                        <el-button
                            size="mini"
                            type="text"
                            icon="el-icon-plus"
                            @click="ev => addChild(ev, node)"
                            >Enfant</el-button
                        >
                        <el-button
                            size="mini"
                            type="text"
                            icon="el-icon-plus"
                            @click="ev => addSibling(ev, node)"
                            >Frère</el-button
                        >

                        <el-button
                            slot="reference"
                            type="text"
                            icon="el-icon-plus"
                            @click="ev => addChild(ev, node)"
                        />
                    </el-popover>
                </span>
            </span>
        </el-tree>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { TreeNode, TreeData } from 'element-ui/types/tree'
import EditableName from './EditableName.vue'

export default Vue.extend({
    name: 'Tree',

    components: {
        EditableName,
    },

    props: {
        onElementClicked: Function,
        elements: Array, // of TreeData
        // Using this instead of v-model because it's simpler here
        onElementsChange: Function,
    },

    data: function() {
        return {
            /** IDs (in TreeData objects) should be written as numbers but read as strings */
            elements_: this.elements as TreeData[],
            renameId: null as string | null,
        }
    },

    watch: {
        /// Having two watchers like this is way simpler than using v-model
        elements(newElts) {
            this.elements_ = newElts
        },
        elements_(newElts) {
            this.onElementsChange(newElts)
        },
    },

    methods: {
        // Generates a new unique ID
        newID(): number {
            let occupiedNumericIDs: number[] = []
            this.elements_.forEach(subtree => {
                this.treeForEach(subtree, node => {
                    const asNumber = Number(node.id)
                    if (Number.isInteger(asNumber)) occupiedNumericIDs.push(asNumber)
                })
            })

            if (occupiedNumericIDs.length == 0) return 0
            if (occupiedNumericIDs.length == 1) {
                if (occupiedNumericIDs[0] == 0) return 1
                else return 0
            }

            occupiedNumericIDs.sort()
            let firstFreeID: number | undefined

            for (let i = 0; i < occupiedNumericIDs.length - 1; i++) {
                const current = occupiedNumericIDs[i]
                const next = occupiedNumericIDs[i + 1]
                // if there is a gap of more than one, we can use it
                // this gives a valid ID because the array is sorted
                if (next - current != 1) firstFreeID = current + 1
            }

            if (!firstFreeID) firstFreeID = occupiedNumericIDs[occupiedNumericIDs.length - 1] + 1

            return firstFreeID
        },

        newNode() {
            let newNode = {
                label: '',
                children: [],
                id: String(this.newID()),
            }
            this.elements_.push(newNode)
            this.toggleRename(newNode)
        },

        addChild(ev: Event, node: TreeNode<string, TreeData>) {
            if (ev) ev.preventDefault()

            const newChild = { id: String(this.newID()), label: '', children: [] }
            if (!node.data.children) {
                node.data.children = []
            }

            node.data.children?.push(newChild)
            this.toggleRename(newChild)
        },

        addSibling(ev: Event, node: TreeNode<string, TreeData>) {
            if (ev) ev.preventDefault()

            let siblings = node.parent?.data.children ?? this.elements_
            const newSibling = { id: String(this.newID()), label: '', children: [] }

            siblings.push(newSibling)
            this.toggleRename(newSibling)
        },

        removeNode(ev: Event, node: TreeNode<string, TreeData>) {
            if (ev) {
                ev.preventDefault()
            }

            this.elements_ = this.elements_
                .map(tree => this.treeFilter(tree, treeElt => treeElt.id != node.data.id))
                .filter(tree => tree != null) as TreeData[]
        },

        onNodeClick(nodeData: TreeData, node: TreeNode<string, TreeData>, component: any) {
            this.onElementClicked(nodeData.id)
        },

        toggleRename(data: TreeData) {
            if (this.renameId == null) {
                this.renameId = data.id
            } else if (this.renameId == data.id) {
                this.renameId = null
            } else {
                // renameId == another id
                this.renameId = data.id
            }
        },

        /** Calls `fn` on each element in the tree */
        treeForEach(tree: TreeData, fn: (t: TreeData) => void) {
            fn(tree)
            tree.children?.forEach(child => this.treeForEach(child, fn))
        },

        /** Makes a new tree, filtering out the elements for which `fn` returns false and their children */
        treeFilter(tree: TreeData, fn: (t: TreeData) => boolean): TreeData | null {
            if (!fn(tree)) {
                return null
            }
            return {
                ...tree,
                children: tree.children
                    ?.map(child => this.treeFilter(child, fn))
                    .filter(child => child != null) as undefined | TreeData[],
            }
            tree.children?.forEach(child => this.treeForEach(child, fn))
        },
    },
})
</script>

<style scoped>
.tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.edit-btn {
    margin-right: 10px;
}
.mr {
    margin-right: 8px;
}
.small {
    height: 14px;
    padding: 0px;
}
</style>
