<template>
  <div id="div">
    <!-- Loading -->
    <template v-if="loading">
      Loading
      <i class="el-icon-loading" />
    </template>

    <!-- Not loading -->
    <template v-else>
      <!-- Query -->
      <template v-if="connected">
        <el-form label-position="right" label-width="110px">
          <el-form-item>
            <el-button @click="close" type="danger">Fermer la connexion</el-button>
          </el-form-item>
          <el-form-item label="requête">
            <el-input clearable v-model="request" type="textarea" placeholder="requête"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="execute(request)" icon="el-icon-search" type="success">Exécuter</el-button>
          </el-form-item>
          <el-form-item label="sélection">
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

      <!-- Login -->
      <template v-else>
        <el-form :model="credentials" label-position="right" label-width="110px">
          <el-form-item label="url du serveur">
            <el-input v-model="credentials.server" placeholder="url" />
          </el-form-item>

          <el-form-item>
            <el-switch
              v-model="useInstanceName"
              border
              active-text="Nom d'instance"
              inactive-text="Port"
            />
          </el-form-item>

          <el-form-item :label="useInstanceName ? 'instance' : 'port'">
            <el-input v-if="useInstanceName" v-model="credentials.instance" placeholder="instance" />
            <el-input v-else v-model="credentials.port" placeholder="port" />
          </el-form-item>

          <el-form-item label="authentification">
            <el-row>
              <el-col :span="8">
                <el-switch v-model="useNTLM" active-text="Utiliser NTLM" />
              </el-col>
              <el-col :span="8">
                <el-switch v-model="useTLSv1" active-text="Utiliser TLSv1" />
              </el-col>
              <el-col :span="8">
                <el-switch v-model="encrypt" active-text="Chiffrer la connexion" />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item v-if="useNTLM" label="domaine">
            <el-input v-model="credentials.domain" placeholder="domaine" />
          </el-form-item>

          <el-form-item label="login">
            <el-input v-model="credentials.userName" placeholder="login" />
          </el-form-item>

          <el-form-item label="mot de passe">
            <el-input v-model="credentials.password" show-password placeholder="mot de passe" />
          </el-form-item>

          <el-form-item label="base">
            <el-input v-model="credentials.database" placeholder="base de données" />
          </el-form-item>

          <el-form-item>
            <el-button @click="connect" type="primary">Se connecter</el-button>
          </el-form-item>
        </el-form>
      </template>

      <template v-if="tableData.length > 0">
        <!-- Results -->
        <el-alert :title="this.lastRequest" type="info" :closable="false"></el-alert>
        <el-table id="table" :data="tableData">
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
import {
  InstanceOrPort,
  AUTH_TYPES,
  AuthType
} from "../database/databaseRenderer";

import { IpcRenderer } from "electron";
// from preload.js
declare const ipcRenderer: IpcRenderer;

export default Vue.extend({
  name: "Database",

  props: {
    selection: String
  },

  data: () => ({
    AUTH_TYPES: AUTH_TYPES,
    loading: false,
    columnNames: [] as string[],
    tableData: [] as Record<string, string>[],
    lastRequest: "",
    useInstanceName: false,
    useTLSv1: true,
    encrypt: true,
    // authKind: "default" as AuthType["kind"],
    useNTLM: true,
    credentials: {
      server: "",
      port: "1433",
      instance: "",
      domain: "",
      userName: "",
      password: "",
      database: ""
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

        const instanceOrPort: InstanceOrPort = this.useInstanceName
          ? { kind: "instance", instanceName: this.credentials.instance }
          : { kind: "port", port: Number(this.credentials.port) };
        const { useTLSv1, encrypt, useNTLM } = this;
        const authType: AuthType = useNTLM
          ? { kind: "ntlm", domain: this.credentials.domain }
          : { kind: "default" };

        await connect(ipcRenderer, {
          ...this.credentials,
          instanceOrPort,
          useTLSv1,
          encrypt,
          authType
        });

        this.connected = true;
      } catch (err) {
        this.connected = false;
        console.error(err);
        this.showError(err);
      }

      this.loading = false;
    },

    async execute(rq: string) {
      this.loading = true;
      try {
        this.lastRequest = rq;

        let resp = await request(ipcRenderer, rq);
        this.tableData = resp.map(row =>
          // For each column, add a property to the object representing the row
          row.reduce(
            (acc, currentColumn) => ({
              ...acc,
              [currentColumn.metadata.colName]: currentColumn.value
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
        console.error(err);
        this.showError(err);
      }
      this.loading = false;
    },

    async close() {
      this.loading = true;
      try {
        await close(ipcRenderer);
      } catch (err) {
        console.error(err);
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
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

#table {
  overflow: scroll;
}
</style>
