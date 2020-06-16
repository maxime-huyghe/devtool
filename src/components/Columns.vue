<template>
  <div>
    <div style="display: flex; flex-direction: row; height: 98%;">
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
import Vue from "vue";

const onMouseDown = (column: "left" | "right") => {};

export default Vue.extend({
  name: "Columns",

  props: {
    leftWidth: Number,
    rightWidth: Number
  },

  data() {
    return {
      // Left/right handle is being dragged.
      lDragged: false,
      rDragged: false,

      // The left and right columns' width in px.
      lw: this.leftWidth ?? 300,
      rw: this.rightWidth ?? 300
    };
  },

  async mounted() {
    await this.$nextTick;

    const right = this.$refs.right as HTMLElement;
    const left = this.$refs.left as HTMLElement;
    const handleRight = this.$refs.handleRight as HTMLElement;
    const handleLeft = this.$refs.handleLeft as HTMLElement;

    right.style.width = this.rw + "px";
    left.style.width = this.lw + "px";

    // Using native html handlers instead of Vue v-on directives for performance reasons.

    // Start of the drag motion.
    handleRight.onmousedown = () => (this.rDragged = true);
    handleLeft.onmousedown = () => (this.lDragged = true);

    // Handles the drag motion.
    handleRight.onmousemove = ev => {
      if (!this.rDragged) return;
      this.rw -= ev.movementX;
      right.style.width = Math.max(this.rw, 300) + "px";
    };
    handleLeft.onmousemove = ev => {
      if (!this.lDragged) return;
      this.lw += ev.movementX;
      left.style.width = Math.max(this.lw, 300) + "px";
    };

    // End of the drag motion.
    const mouseUp = () => {
      this.rDragged = false;
      this.lDragged = false;
    };
    handleRight.onmouseup = mouseUp;
    handleRight.onmouseleave = mouseUp;
    handleLeft.onmouseup = mouseUp;
    handleLeft.onmouseleave = mouseUp;
  },

  beforeDestroy() {
    const handleRight = this.$refs.handleRight as HTMLElement;
    const handleLeft = this.$refs.handleLeft as HTMLElement;

    [handleLeft, handleRight].forEach(col => {
      col.onmousedown = null;
      col.onmousemove = null;
      col.onmouseup = null;
      col.onmouseleave = null;
    });
  }
});
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