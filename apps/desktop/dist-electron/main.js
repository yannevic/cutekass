"use strict";
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const dbPath = path.join(electron.app.getPath("userData"), "accounts.db");
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
function listAccounts() {
  return db.prepare("SELECT * FROM accounts WHERE deletedAt IS NULL").all();
}
function listTrash() {
  return db.prepare("SELECT * FROM accounts WHERE deletedAt IS NOT NULL").all();
}
function addAccount(data) {
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
    deletedAt: data.deletedAt ?? null
  };
  const result = stmt.run(sanitized);
  return { id: result.lastInsertRowid, ...data };
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
function updateAccount(data) {
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
    observacoes: data.observacoes ?? null
  });
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
electron.ipcMain.handle("update-account", (_e, data) => updateAccount(data));
electron.ipcMain.handle("get-accounts", () => listAccounts());
electron.ipcMain.handle("get-trash", () => listTrash());
electron.ipcMain.handle("add-account", (_e, data) => addAccount(data));
electron.ipcMain.handle("delete-account", (_e, id) => softDeleteAccount(id));
electron.ipcMain.handle("restore-account", (_e, id) => restoreAccount(id));
electron.ipcMain.handle("permanent-delete", (_e, id) => hardDeleteAccount(id));
electron.ipcMain.handle("copy-to-clipboard", (_e, text) => {
  electron.clipboard.writeText(text);
});
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
