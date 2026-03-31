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
  copyToClipboard: (text) => electron.ipcRenderer.invoke("copy-to-clipboard", text)
});
