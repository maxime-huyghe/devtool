<template>
    <span @click="startEditing">
        <el-popover placement="top" trigger="manual" v-model="editing">
            <span slot="reference">
                <el-button v-if="value.length > 0" type="text" icon="el-icon-edit">
                    {{
                    value
                    }}
                </el-button>
                <el-button v-else type="text" icon="el-icon-plus">nommer</el-button>
            </span>

            <el-input
                size="mini"
                @change="editing = false"
                @blur="editing = false"
                @input="update"
                :value="value"
                ref="input"
                placeholder="Entrez un nom"
            >
                <el-button slot="append" @click="stopEditing" icon="el-icon-close" />
            </el-input>
        </el-popover>
    </span>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
    name: 'EditableName',
    props: {
        value: String,
    },

    data: function() {
        return {
            editing: false,
            valueBeforeEditing: this.value,
        }
    },

    mounted() {
        ;(this.$refs.input as any)?.focus()
    },

    methods: {
        async startEditing(ev: Event) {
            ev.preventDefault()
            this.editing = true
            this.valueBeforeEditing = (this.$refs.input as any)?.value
            await Vue.nextTick()
            ;(this.$refs.input as any)?.focus()
        },

        stopEditing(ev: Event) {
            this.$emit('input', this.valueBeforeEditing)
        },

        update(ev: string) {
            this.$emit('input', ev)
        },
    },
})
</script>
