<template>
    <div>
        <div ref="parent" style="display: flex; flex-direction: row; height: 98%;">
            <!-- Left column -->
            <div id="left" ref="left">
                <slot name="left" />
            </div>

            <div ref="handleLeft" class="resize-handle">
                <div>
                    <i class="el-icon-caret-right" />
                    <br />
                    <i class="el-icon-caret-left" />
                </div>
            </div>

            <!-- Middle column -->
            <div id="mid" ref="mid">
                <slot />
            </div>

            <div ref="handleRight" class="resize-handle">
                <div>
                    <i class="el-icon-caret-right" />
                    <br />
                    <i class="el-icon-caret-left" />
                </div>
            </div>

            <!-- Right column -->
            <div id="right" ref="right">
                <slot name="right" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { debounce } from 'lodash'

const minWidth = 150

const rightColKey = 'right'
const leftColKey = 'left'

export default Vue.extend({
    name: 'Columns',

    props: {
        leftWidth: Number,
        rightWidth: Number,
    },

    data() {
        return {
            // Left/right handle is being dragged.
            lDragged: false,
            rDragged: false,

            // The left and right columns' width in px.
            lw: this.leftWidth ?? minWidth,
            rw: this.rightWidth ?? minWidth,
        }
    },

    async mounted() {
        await Vue.nextTick()

        const parent = this.$refs.parent as HTMLElement
        const right = this.$refs.right as HTMLElement
        const left = this.$refs.left as HTMLElement
        const handleRight = this.$refs.handleRight as HTMLElement
        const handleLeft = this.$refs.handleLeft as HTMLElement

        const rightWidth = Number(localStorage.getItem(rightColKey))
        if (rightWidth) {
            this.rw = rightWidth
        }
        right.style.width = this.rw + 'px'

        const leftWidth = Number(localStorage.getItem(leftColKey))
        if (leftWidth) {
            this.lw = leftWidth
        }
        left.style.width = this.lw + 'px'

        // Using native html handlers instead of Vue v-on directives for performance reasons.

        // Set column width in localstorage to width in data. Debounced for perf reasons.
        const setRightWidth = debounce(
            () => localStorage.setItem(rightColKey, String(this.rw)),
            100,
        )
        const setLeftWidth = debounce(() => localStorage.setItem(leftColKey, String(this.lw)), 100)

        // Handles the drag motion.
        const mouseMove = (ev: MouseEvent) => {
            ev.preventDefault()
            if (this.rDragged) {
                this.rw -= ev.movementX
                right.style.width = Math.max(this.rw, minWidth) + 'px'
                setRightWidth()
            }
            if (this.lDragged) {
                this.lw += ev.movementX
                left.style.width = Math.max(this.lw, minWidth) + 'px'
                setLeftWidth()
            }
        }

        // Start of the drag motion.
        handleRight.onmousedown = () => {
            this.rDragged = true
            parent.onmousemove = mouseMove
        }
        handleLeft.onmousedown = () => {
            this.lDragged = true
            parent.onmousemove = mouseMove
        }

        // End of the drag motion.
        parent.onmouseup = () => {
            this.rDragged = false
            this.lDragged = false
            parent.onmousemove = null
        }
    },

    beforeDestroy() {
        // If we don't do this, the application will act strange when it is reloaded
        const handleRight = this.$refs.handleRight as HTMLElement
        const handleLeft = this.$refs.handleLeft as HTMLElement
        ;[handleLeft, handleRight].forEach(handle => {
            handle.onmousedown = null
            handle.onmousemove = null
            handle.onmouseup = null
            handle.onmouseleave = null
        })
    },
})
</script>

<style scoped>
#mid {
    flex: 1;
}
#left,
#right {
    height: 98%;
    padding-top: 1%;
    padding-bottom: 1%;
}
#left {
    padding-left: 1%;
}
#right {
    padding-right: 1%;
}

.resize-handle {
    margin: 0px;
    width: 1%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    /* height: 100%; */
    user-select: none;
    cursor: col-resize;
}
</style>
