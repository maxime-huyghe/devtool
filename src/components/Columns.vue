<template>
  <div>
    <div style="display: flex; flex-direction: row; height: 98%;">
      <!-- Left column -->
      <div id="left" ref="left">
        <slot name="left" />
      </div>

      <div
        class="resize-handle"
        @mousedown="(ev) => onMouseDown(ev, 'left')"
        @mousemove="(ev) => onMouseMove(ev, 'left')"
        @mouseup="(ev) => onMouseUp(ev, 'left')"
        @mouseleave="(ev) => onMouseUp(ev, 'left')"
      >
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

      <div
        class="resize-handle"
        @mousedown="(ev) => onMouseDown(ev, 'right')"
        @mousemove="(ev) => onMouseMove(ev, 'right')"
        @mouseup="(ev) => onMouseUp(ev, 'right')"
        @mouseleave="(ev) => onMouseUp(ev, 'right')"
      >
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
import Vue from "vue";
export default Vue.extend({
  name: "Columns",

  props: {
    leftWidth: Number,
    rightWidth: Number
  },

  data() {
    return {
      // Whether a column is being dragged, and which one. This is set in the onMouse(Down|Move|Up) handlers.
      lDragged: false,
      rDragged: false,

      // The left and right columns' width in px.
      lw: this.leftWidth ?? 300,
      rw: this.rightWidth ?? 300
    };
  },

  mounted() {
    (this.$refs.right as HTMLElement).style.width = this.rw + "px";
    (this.$refs.left as HTMLElement).style.width = this.lw + "px";
  },

  methods: {
    // Attached to the resize handles: if the drag starts on them, the user wants to resize.
    onMouseDown(ev: MouseEvent, whichColumn: "right" | "left") {
      switch (whichColumn) {
        case "right":
          this.rDragged = true;
          break;
        case "left":
          this.lDragged = true;
          break;
      }
    },

    // Due to how Vue handles events asynchronously, the mouse can leave the element before it has
    // reached the correct position and ruin our day. That's why this handler is attached to the
    // root. Potentially terrible for performance.
    onMouseMove(ev: MouseEvent, whichColumn: "right" | "left") {
      switch (whichColumn) {
        case "right":
          if (!this.rDragged) return;
          this.rw -= ev.movementX;
          (this.$refs.right as HTMLElement).style.width =
            Math.max(this.rw, 300) + "px";
          break;
        case "left":
          if (!this.lDragged) return;
          this.lw += ev.movementX;
          (this.$refs.left as HTMLElement).style.width =
            Math.max(this.lw, 300) + "px";
          break;
      }
    },

    // See onMouseMove
    onMouseUp(ev: MouseEvent, whichColumn: "right" | "left") {
      switch (whichColumn) {
        case "right":
          this.rDragged = false;
          break;
        case "left":
          this.lDragged = false;
          break;
      }
    }
  }
});
</script>

<style scoped>
.col {
  border-left: 1px solid;
  border-right: 1px solid;
}

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