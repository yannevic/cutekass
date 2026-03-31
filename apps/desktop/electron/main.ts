import { app, BrowserWindow, ipcMain, clipboard } from 'electron';
import { join } from 'path';
import {
  listAccounts,
  listTrash,
  addAccount,
  updateAccount,
  softDeleteAccount,
  restoreAccount,
  hardDeleteAccount,
  bulkSoftDelete,
  bulkSetElo,
  bulkMovePasta,
  listPastas,
  addPasta,
  updatePasta,
  deletePasta,
} from '../src/lib/db';

// ─── Janela ───────────────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(join(__dirname, '../dist/index.html'));
  }
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('get-accounts', () => listAccounts());
ipcMain.handle('get-trash', () => listTrash());
ipcMain.handle('add-account', (_e, data) => addAccount(data));
ipcMain.handle('update-account', (_e, data) => updateAccount(data));
ipcMain.handle('delete-account', (_e, id) => softDeleteAccount(id));
ipcMain.handle('restore-account', (_e, id) => restoreAccount(id));
ipcMain.handle('permanent-delete', (_e, id) => hardDeleteAccount(id));
ipcMain.handle('copy-to-clipboard', (_e, text: string) => {
  clipboard.writeText(text);
});
ipcMain.handle('bulk-delete', (_e, ids: number[]) => bulkSoftDelete(ids));
ipcMain.handle('bulk-set-elo', (_e, ids: number[], elo: string) => bulkSetElo(ids, elo));
ipcMain.handle('bulk-move-pasta', (_e, ids: number[], pastaId: number | null) =>
  bulkMovePasta(ids, pastaId)
);
ipcMain.handle('get-pastas', () => listPastas());
ipcMain.handle('add-pasta', (_e, nome: string, cor: string) => addPasta(nome, cor));
ipcMain.handle('update-pasta', (_e, id: number, nome: string, cor: string) =>
  updatePasta(id, nome, cor)
);
ipcMain.handle('delete-pasta', (_e, id: number) => deletePasta(id));

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
