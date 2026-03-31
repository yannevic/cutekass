"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getAccounts: () => electron_1.ipcRenderer.invoke('get-accounts'),
    addAccount: (account) => electron_1.ipcRenderer.invoke('add-account', account),
    deleteAccount: (id) => electron_1.ipcRenderer.invoke('delete-account', id),
    restoreAccount: (id) => electron_1.ipcRenderer.invoke('restore-account', id),
    permanentDelete: (id) => electron_1.ipcRenderer.invoke('permanent-delete', id),
    getTrash: () => electron_1.ipcRenderer.invoke('get-trash'),
    copyToClipboard: (text) => electron_1.ipcRenderer.invoke('copy-to-clipboard', text),
});
