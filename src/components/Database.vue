<template>
  <div>
    <el-button type="primary">Test</el-button>
    <el-button type="primary">Aussi</el-button>
    <el-input></el-input>
    <el-input></el-input>
    <el-input></el-input>
    <el-table :data="tableData" height="80%">
      <el-table-column prop="date" label="Date" width="180"></el-table-column>
      <el-table-column prop="name" label="Name" width="180"></el-table-column>
      <el-table-column prop="address" label="Address"></el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Database",
  data: () => ({
    tableData: Array.from({ length: 100 }, () => ({
      date: "2016-05-03",
      name: "Tom",
      address: "No. 189, Grove St, Los Angeles"
    }))
  })
});
</script>

<style scoped>
.container {
  height: 90vh;
  overflow: auto;
}
</style>
