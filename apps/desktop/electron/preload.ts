import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (account: unknown) => ipcRenderer.invoke('add-account', account),
  deleteAccount: (id: number) => ipcRenderer.invoke('delete-account', id),
  restoreAccount: (id: number) => ipcRenderer.invoke('restore-account', id),
  permanentDelete: (id: number) => ipcRenderer.invoke('permanent-delete', id),
  getTrash: () => ipcRenderer.invoke('get-trash'),
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
});
