"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  getAccounts: () => electron.ipcRenderer.invoke("get-accounts"),
  addAccount: (account) => electron.ipcRenderer.invoke("add-account", account),
  updateAccount: (account) => electron.ipcRenderer.invoke("update-account", account),
  deleteAccount: (id) => electron.ipcRenderer.invoke("delete-account", id),
  restoreAccount: (id) => electron.ipcRenderer.invoke("restore-account", id),
  permanentDelete: (id) => electron.ipcRenderer.invoke("permanent-delete", id),
  getTrash: () => electron.ipcRenderer.invoke("get-trash"),
  copyToClipboard: (text) => electron.ipcRenderer.invoke("copy-to-clipboard", text),
  bulkDelete: (ids) => electron.ipcRenderer.invoke("bulk-delete", ids),
  bulkSetElo: (ids, elo) => electron.ipcRenderer.invoke("bulk-set-elo", ids, elo),
  bulkMovePasta: (ids, pastaId) => electron.ipcRenderer.invoke("bulk-move-pasta", ids, pastaId),
  getPastas: () => electron.ipcRenderer.invoke("get-pastas"),
  addPasta: (nome, cor) => electron.ipcRenderer.invoke("add-pasta", nome, cor),
  updatePasta: (id, nome, cor) => electron.ipcRenderer.invoke("update-pasta", id, nome, cor),
  deletePasta: (id) => electron.ipcRenderer.invoke("delete-pasta", id),
  exportAccounts: (ids) => electron.ipcRenderer.invoke("export-accounts", ids),
  getRiotKey: () => electron.ipcRenderer.invoke("get-riot-key"),
  saveRiotKey: (key) => electron.ipcRenderer.invoke("save-riot-key", key),
  fetchElo: (nick) => electron.ipcRenderer.invoke("fetch-elo", nick),
  loginRiot: (login, senha) => electron.ipcRenderer.invoke("login-riot", login, senha),
  getRiotClientPath: () => electron.ipcRenderer.invoke("get-riot-client-path"),
  saveRiotClientPath: (path) => electron.ipcRenderer.invoke("save-riot-client-path", path)
});
