<template>
  <div>
    <!-- Loading -->
    <template v-if="loading">
      Loading
      <i class="el-icon-loading" />
    </template>
    <!-- Not loading -->
    <template v-else>
      <template v-if="connected">
        <el-input v-model="request" placeholder="requête"></el-input>
        <el-button @click="execute" type="success">Exécuter</el-button>
        <el-button @click="close" type="danger">Fermer la connexion</el-button>
      </template>
      <template v-else>
        <el-input v-model="url" placeholder="url"></el-input>
        <el-input v-model="login" placeholder="login"></el-input>
        <el-input v-model="password" placeholder="mot de passe"></el-input>
        <el-button @click="connect" type="primary">Se connecter</el-button>
      </template>
      <template v-if="tableData.length > 0">
        <el-alert :title="this.resultRequest" type="info" :closable="false"></el-alert>
        <el-table :data="tableData" height="80%">
          <el-table-column
            v-for="column in columnNames"
            :prop="column"
            :label="column"
            :key="column"
          ></el-table-column>
        </el-table>
      </template>
    </template>
  </div>
</template>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  connect,
  request,
  close,
  ColumnValue
} from "@/database/databaseRenderer";
import { IpcRenderer } from "electron";
declare var ipcRenderer: IpcRenderer;

let fn = async () => {};

export default Vue.extend({
  name: "Database",

  data: () => ({
    loading: false,
    columnNames: [] as string[],
    tableData: [] as Record<string, string>[],
    resultRequest: "",
    url: "localhost",
    login: "SA",
    password: "P@55w0rd123",
    connected: false,
    request: "select * from test"
  }),

  methods: {
    showError(error: string) {
      this.$message({
        showClose: true,
        message: error,
        type: "error",
        duration: 0
      });
    },

    async connect() {
      try {
        this.loading = true;
        await connect(ipcRenderer, this.url, this.login, this.password);
        this.connected = true;
      } catch (err) {
        this.connected = false;
        this.showError(err);
      }
      this.loading = false;
    },

    async execute() {
      this.loading = true;
      try {
        let resp = await request(ipcRenderer, this.request);
        this.resultRequest = this.request;
        this.tableData = resp.map(row =>
          row.reduce(
            (acc, current) => ({
              ...acc,
              [current.metadata.colName]: current.value
            }),
            {} as Record<string, string>
          )
        );
        this.columnNames =
          resp.length > 0
            ? resp[0].length > 0
              ? resp[0].map(col => col.metadata.colName)
              : []
            : [];
      } catch (err) {
        this.showError(err);
      }
      this.loading = false;
    },

    async close() {
      this.loading = true;
      try {
        await close(ipcRenderer);
      } catch (err) {
        this.showError(err);
      }
      this.connected = false;
      this.loading = false;
    }
  }
});
</script>

<style scoped>
.container {
  height: 90vh;
  overflow: auto;
}
</style>
