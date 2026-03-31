import { app, BrowserWindow, ipcMain, clipboard } from 'electron';
import { join } from 'path';
import Database from 'better-sqlite3';
import type { Account } from '../src/types/account';
import type { Pasta } from '../src/types/pasta';

// ─── Banco de dados ───────────────────────────────────────────────────────────

const dbPath = join(app.getPath('userData'), 'accounts.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS pastas (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cor  TEXT NOT NULL DEFAULT '#6366f1'
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    login       TEXT NOT NULL,
    senha       TEXT NOT NULL,
    nick        TEXT,
    elo         TEXT,
    observacoes TEXT,
    deletedAt   TEXT,
    pastaId     INTEGER
  );
`);

// Migração: adiciona pastaId em bancos que ainda não têm a coluna
try {
  db.exec('ALTER TABLE accounts ADD COLUMN pastaId INTEGER');
} catch {
  // coluna já existe, ignorar
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

function listAccounts(): Account[] {
  return db.prepare('SELECT * FROM accounts WHERE deletedAt IS NULL').all() as Account[];
}

function listTrash(): Account[] {
  return db.prepare('SELECT * FROM accounts WHERE deletedAt IS NOT NULL').all() as Account[];
}

function addAccount(data: Omit<Account, 'id'>): Account {
  const stmt = db.prepare(`
    INSERT INTO accounts (login, senha, nick, elo, observacoes, deletedAt, pastaId)
    VALUES (@login, @senha, @nick, @elo, @observacoes, @deletedAt, @pastaId)
  `);
  const sanitized = {
    login: data.login,
    senha: data.senha,
    nick: data.nick ?? null,
    elo: data.elo ?? null,
    observacoes: data.observacoes ?? null,
    deletedAt: data.deletedAt ?? null,
    pastaId: data.pastaId ?? null,
  };
  const result = stmt.run(sanitized);
  return { id: result.lastInsertRowid as number, ...data };
}

function updateAccount(data: Account): void {
  db.prepare(
    `
    UPDATE accounts
    SET login = @login, senha = @senha, nick = @nick,
        elo = @elo, observacoes = @observacoes, pastaId = @pastaId
    WHERE id = @id
  `
  ).run({
    id: data.id,
    login: data.login,
    senha: data.senha,
    nick: data.nick ?? null,
    elo: data.elo ?? null,
    observacoes: data.observacoes ?? null,
    pastaId: data.pastaId ?? null,
  });
}

function softDeleteAccount(id: number): void {
  db.prepare('UPDATE accounts SET deletedAt = @deletedAt WHERE id = @id').run({
    deletedAt: new Date().toISOString(),
    id,
  });
}

function restoreAccount(id: number): void {
  db.prepare('UPDATE accounts SET deletedAt = NULL WHERE id = @id').run({ id });
}

function hardDeleteAccount(id: number): void {
  db.prepare('DELETE FROM accounts WHERE id = @id').run({ id });
}

// ─── Bulk ──────────────────────────────────────────────────────────────────────

function bulkSoftDelete(ids: number[]): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE accounts SET deletedAt = ? WHERE id IN (${placeholders})`).run(
    new Date().toISOString(),
    ...ids
  );
}

function bulkSetElo(ids: number[], elo: string): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE accounts SET elo = ? WHERE id IN (${placeholders})`).run(elo, ...ids);
}

function bulkMovePasta(ids: number[], pastaId: number | null): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE accounts SET pastaId = ? WHERE id IN (${placeholders})`).run(pastaId, ...ids);
}

// ─── Pastas ───────────────────────────────────────────────────────────────────

function listPastas(): Pasta[] {
  return db.prepare('SELECT * FROM pastas ORDER BY id ASC').all() as Pasta[];
}

function addPasta(nome: string, cor: string): Pasta {
  const result = db
    .prepare('INSERT INTO pastas (nome, cor) VALUES (@nome, @cor)')
    .run({ nome, cor });
  return { id: result.lastInsertRowid as number, nome, cor };
}

function updatePasta(id: number, nome: string, cor: string): void {
  db.prepare('UPDATE pastas SET nome = @nome, cor = @cor WHERE id = @id').run({ id, nome, cor });
}

function deletePasta(id: number): void {
  db.prepare('UPDATE accounts SET pastaId = NULL WHERE pastaId = @id').run({ id });
  db.prepare('DELETE FROM pastas WHERE id = @id').run({ id });
}

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
