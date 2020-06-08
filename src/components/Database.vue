<template>
  <div>
    <el-button type="primary">Test</el-button>
    <el-button type="primary">Aussi</el-button>
    <el-input></el-input>
    <el-input></el-input>
    <el-input></el-input>
    <el-table :data="tableData" style="width: 100%">
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
    tableData: [
      {
        date: "2016-05-03",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles"
      },
      {
        date: "2016-05-02",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles"
      },
      {
        date: "2016-05-04",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles"
      },
      {
        date: "2016-05-01",
        name: "Tom",
        address: "No. 189, Grove St, Los Angeles"
      }
    ]
  })
});
</script>

<style scoped>
.container {
  height: 90vh;
  overflow: auto;
}
</style>
