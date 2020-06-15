<template>
  <div id="div">
    <!-- Loading -->
    <template v-if="loading">
      Loading
      <i class="el-icon-loading" />
    </template>
    <!-- Not loading -->
    <template v-else>
      <template v-if="connected">
        <el-form label-position="right" label-width="110px">
          <el-form-item>
            <el-button @click="close" type="danger">Fermer la connexion</el-button>
          </el-form-item>
          <el-form-item label="requête :">
            <el-input clearable v-model="request" type="textarea" placeholder="requête :"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="execute(request)" icon="el-icon-search" type="success">Exécuter</el-button>
          </el-form-item>
          <el-form-item label="sélection :">
            <template v-if="selection">{{ selection }}</template>
            <template v-else>
              <i class="el-icon-error" />
            </template>
          </el-form-item>
          <el-form-item>
            <el-button @click="execute(selection)" icon="el-icon-search" type="success">Exécuter</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-else>
        <el-form :model="credentials" label-position="right" label-width="110px">
          <el-form-item label="url :">
            <el-input v-model="credentials.url" placeholder="url" />
          </el-form-item>
          <el-form-item label="login :">
            <el-input v-model="credentials.login" placeholder="login" />
          </el-form-item>
          <el-form-item label="mot de passe :">
            <el-input v-model="credentials.password" show-password placeholder="mot de passe" />
          </el-form-item>
          <el-form-item>
            <el-button @click="connect" type="primary">Se connecter</el-button>
          </el-form-item>
        </el-form>
      </template>
      <template v-if="tableData.length > 0">
        <el-alert :title="this.resultRequest" type="info" :closable="false"></el-alert>
        <el-table :data="tableData">
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

<script lang="ts">
import Vue from "vue";
import {
  connect,
  request,
  close,
  ColumnValue
} from "@/database/databaseRenderer";
import { IpcRenderer } from "electron";
// from preload.js
declare const ipcRenderer: IpcRenderer;

let fn = async () => {};

export default Vue.extend({
  name: "Database",

  props: {
    selection: String
  },

  data: () => ({
    loading: false,
    columnNames: [] as string[],
    tableData: [] as Record<string, string>[],
    resultRequest: "",
    credentials: {
      url: "",
      login: "",
      password: ""
    },
    connected: false,
    request: ""
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
        await connect(
          ipcRenderer,
          this.credentials.url,
          this.credentials.login,
          this.credentials.password
        );
        this.connected = true;
      } catch (err) {
        this.connected = false;
        this.showError(err);
      }
      this.loading = false;
    },

    async execute(rq: string) {
      this.loading = true;
      try {
        let resp = await request(ipcRenderer, rq);
        this.resultRequest = rq;
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
#div {
  margin: 10px;
}
</style>
