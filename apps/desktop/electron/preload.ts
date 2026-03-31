import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (account: Record<string, unknown>) => ipcRenderer.invoke('add-account', account),
  updateAccount: (account: Record<string, unknown>) =>
    ipcRenderer.invoke('update-account', account),
  deleteAccount: (id: number) => ipcRenderer.invoke('delete-account', id),
  restoreAccount: (id: number) => ipcRenderer.invoke('restore-account', id),
  permanentDelete: (id: number) => ipcRenderer.invoke('permanent-delete', id),
  getTrash: () => ipcRenderer.invoke('get-trash'),
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
  bulkDelete: (ids: number[]) => ipcRenderer.invoke('bulk-delete', ids),
  bulkSetElo: (ids: number[], elo: string) => ipcRenderer.invoke('bulk-set-elo', ids, elo),
  bulkMovePasta: (ids: number[], pastaId: number | null) =>
    ipcRenderer.invoke('bulk-move-pasta', ids, pastaId),
  getPastas: () => ipcRenderer.invoke('get-pastas'),
  addPasta: (nome: string, cor: string) => ipcRenderer.invoke('add-pasta', nome, cor),
  updatePasta: (id: number, nome: string, cor: string) =>
    ipcRenderer.invoke('update-pasta', id, nome, cor),
  deletePasta: (id: number) => ipcRenderer.invoke('delete-pasta', id),
  exportAccounts: (ids: number[]) => ipcRenderer.invoke('export-accounts', ids),
  getRiotKey: () => ipcRenderer.invoke('get-riot-key'),
  saveRiotKey: (key: string) => ipcRenderer.invoke('save-riot-key', key),
  fetchElo: (nick: string) => ipcRenderer.invoke('fetch-elo', nick),
  loginRiot: (login: string, senha: string) => ipcRenderer.invoke('login-riot', login, senha),
  getRiotClientPath: () => ipcRenderer.invoke('get-riot-client-path'),
  saveRiotClientPath: (path: string) => ipcRenderer.invoke('save-riot-client-path', path),
});
