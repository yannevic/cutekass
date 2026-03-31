import { app, BrowserWindow, ipcMain, clipboard } from 'electron';
import { join } from 'path';
import Database from 'better-sqlite3';
import type { Account } from '../src/types/account';

// ─── Banco de dados ───────────────────────────────────────────────────────────

const dbPath = join(app.getPath('userData'), 'accounts.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    login       TEXT NOT NULL,
    senha       TEXT NOT NULL,
    nick        TEXT NOT NULL,
    elo         TEXT,
    observacoes TEXT,
    deletedAt   TEXT
  )
`);

function listAccounts(): Account[] {
  return db.prepare('SELECT * FROM accounts WHERE deletedAt IS NULL').all() as Account[];
}

function listTrash(): Account[] {
  return db.prepare('SELECT * FROM accounts WHERE deletedAt IS NOT NULL').all() as Account[];
}

function addAccount(data: Omit<Account, 'id'>): Account {
  const stmt = db.prepare(`
    INSERT INTO accounts (login, senha, nick, elo, observacoes, deletedAt)
    VALUES (@login, @senha, @nick, @elo, @observacoes, @deletedAt)
  `);

  const sanitized = {
    login: data.login,
    senha: data.senha,
    nick: data.nick,
    elo: data.elo ?? null,
    observacoes: data.observacoes ?? null,
    deletedAt: data.deletedAt ?? null,
  };

  const result = stmt.run(sanitized);
  return { id: result.lastInsertRowid as number, ...data };
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

function updateAccount(data: Account): void {
  const stmt = db.prepare(`
    UPDATE accounts
    SET login = @login, senha = @senha, nick = @nick,
        elo = @elo, observacoes = @observacoes
    WHERE id = @id
  `);
  stmt.run({
    id: data.id,
    login: data.login,
    senha: data.senha,
    nick: data.nick,
    elo: data.elo ?? null,
    observacoes: data.observacoes ?? null,
  });
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
ipcMain.handle('update-account', (_e, data) => updateAccount(data));
ipcMain.handle('get-accounts', () => listAccounts());
ipcMain.handle('get-trash', () => listTrash());
ipcMain.handle('add-account', (_e, data) => addAccount(data));
ipcMain.handle('delete-account', (_e, id) => softDeleteAccount(id));
ipcMain.handle('restore-account', (_e, id) => restoreAccount(id));
ipcMain.handle('permanent-delete', (_e, id) => hardDeleteAccount(id));
ipcMain.handle('copy-to-clipboard', (_e, text: string) => {
  clipboard.writeText(text);
});

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
