"use strict";
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const dbPath = path.join(electron.app.getPath("userData"), "accounts.db");
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
try {
  db.exec("ALTER TABLE accounts ADD COLUMN pastaId INTEGER");
} catch {
}
function listAccounts() {
  return db.prepare("SELECT * FROM accounts WHERE deletedAt IS NULL").all();
}
function listTrash() {
  return db.prepare("SELECT * FROM accounts WHERE deletedAt IS NOT NULL").all();
}
function addAccount(data) {
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
    pastaId: data.pastaId ?? null
  };
  const result = stmt.run(sanitized);
  return { id: result.lastInsertRowid, ...data };
}
function updateAccount(data) {
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
    pastaId: data.pastaId ?? null
  });
}
function softDeleteAccount(id) {
  db.prepare("UPDATE accounts SET deletedAt = @deletedAt WHERE id = @id").run({
    deletedAt: (/* @__PURE__ */ new Date()).toISOString(),
    id
  });
}
function restoreAccount(id) {
  db.prepare("UPDATE accounts SET deletedAt = NULL WHERE id = @id").run({ id });
}
function hardDeleteAccount(id) {
  db.prepare("DELETE FROM accounts WHERE id = @id").run({ id });
}
function bulkSoftDelete(ids) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  db.prepare(`UPDATE accounts SET deletedAt = ? WHERE id IN (${placeholders})`).run(
    (/* @__PURE__ */ new Date()).toISOString(),
    ...ids
  );
}
function bulkSetElo(ids, elo) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  db.prepare(`UPDATE accounts SET elo = ? WHERE id IN (${placeholders})`).run(elo, ...ids);
}
function bulkMovePasta(ids, pastaId) {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => "?").join(",");
  db.prepare(`UPDATE accounts SET pastaId = ? WHERE id IN (${placeholders})`).run(pastaId, ...ids);
}
function listPastas() {
  return db.prepare("SELECT * FROM pastas ORDER BY id ASC").all();
}
function addPasta(nome, cor) {
  const result = db.prepare("INSERT INTO pastas (nome, cor) VALUES (@nome, @cor)").run({ nome, cor });
  return { id: result.lastInsertRowid, nome, cor };
}
function updatePasta(id, nome, cor) {
  db.prepare("UPDATE pastas SET nome = @nome, cor = @cor WHERE id = @id").run({ id, nome, cor });
}
function deletePasta(id) {
  db.prepare("UPDATE accounts SET pastaId = NULL WHERE pastaId = @id").run({ id });
  db.prepare("DELETE FROM pastas WHERE id = @id").run({ id });
}
function createWindow() {
  const win = new electron.BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
electron.ipcMain.handle("get-accounts", () => listAccounts());
electron.ipcMain.handle("get-trash", () => listTrash());
electron.ipcMain.handle("add-account", (_e, data) => addAccount(data));
electron.ipcMain.handle("update-account", (_e, data) => updateAccount(data));
electron.ipcMain.handle("delete-account", (_e, id) => softDeleteAccount(id));
electron.ipcMain.handle("restore-account", (_e, id) => restoreAccount(id));
electron.ipcMain.handle("permanent-delete", (_e, id) => hardDeleteAccount(id));
electron.ipcMain.handle("copy-to-clipboard", (_e, text) => {
  electron.clipboard.writeText(text);
});
electron.ipcMain.handle("bulk-delete", (_e, ids) => bulkSoftDelete(ids));
electron.ipcMain.handle("bulk-set-elo", (_e, ids, elo) => bulkSetElo(ids, elo));
electron.ipcMain.handle(
  "bulk-move-pasta",
  (_e, ids, pastaId) => bulkMovePasta(ids, pastaId)
);
electron.ipcMain.handle("get-pastas", () => listPastas());
electron.ipcMain.handle("add-pasta", (_e, nome, cor) => addPasta(nome, cor));
electron.ipcMain.handle(
  "update-pasta",
  (_e, id, nome, cor) => updatePasta(id, nome, cor)
);
electron.ipcMain.handle("delete-pasta", (_e, id) => deletePasta(id));
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
