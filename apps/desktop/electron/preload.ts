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
  addPasta: (nome: string, cor: string, icone: string) =>
    ipcRenderer.invoke('add-pasta', nome, cor, icone),
  updatePasta: (id: number, nome: string, cor: string, icone: string) =>
    ipcRenderer.invoke('update-pasta', id, nome, cor, icone),
  reorderPastas: (ids: number[]) => ipcRenderer.invoke('reorder-pastas', ids),
  deletePasta: (id: number) => ipcRenderer.invoke('delete-pasta', id),
  exportAccounts: (ids: number[]) => ipcRenderer.invoke('export-accounts', ids),
  exportAccountsEncrypted: (ids: number[], senha: string) =>
    ipcRenderer.invoke('export-accounts-encrypted', ids, senha),
  getRiotKey: () => ipcRenderer.invoke('get-riot-key'),
  saveRiotKey: (key: string) => ipcRenderer.invoke('save-riot-key', key),
  fetchElo: (nick: string) => ipcRenderer.invoke('fetch-elo', nick),
  loginRiot: (login: string, senha: string) => ipcRenderer.invoke('login-riot', login, senha),
  getRiotClientPath: () => ipcRenderer.invoke('get-riot-client-path'),
  saveRiotClientPath: (path: string) => ipcRenderer.invoke('save-riot-client-path', path),
  emptyTrash: () => ipcRenderer.invoke('empty-trash'),
  bulkAddAccounts: (dados: Record<string, unknown>[]) =>
    ipcRenderer.invoke('bulk-add-accounts', dados),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onUpdateAvailable: (cb: () => void) => ipcRenderer.on('update-available', cb),
  onUpdateNotAvailable: (cb: () => void) => ipcRenderer.on('update-not-available', cb),
  onUpdateDownloaded: (cb: () => void) => ipcRenderer.on('update-downloaded', cb),
  onUpdateError: (cb: (msg: string) => void) =>
    ipcRenderer.on('update-error', (_e, msg) => cb(msg)),
  reorderAccounts: (ids: number[]) => ipcRenderer.invoke('reorder-accounts', ids),
  listarHistoricoBackup: () => ipcRenderer.invoke('listar-historico-backup'),
  gerarColagemSkins: (skinsNomes: string[], nick: string, idioma: string) =>
    ipcRenderer.invoke('gerar-colagem-skins', skinsNomes, nick, idioma),
  fetchLcuData: () => ipcRenderer.invoke('fetch-lcu-data'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  winMinimize: () => ipcRenderer.send('win-minimize'),
  winMaximize: () => ipcRenderer.send('win-maximize'),
  winClose: () => ipcRenderer.send('win-close'),
  getVersion: () => ipcRenderer.invoke('get-version'),
});
