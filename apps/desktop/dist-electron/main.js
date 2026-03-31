"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const fs = require("fs");
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
try {
  const col = db.prepare(`PRAGMA table_info(accounts)`).all().find((c) => c.name === "nick");
  if ((col == null ? void 0 : col.notnull) === 1) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts_new (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        login       TEXT NOT NULL,
        senha       TEXT NOT NULL,
        nick        TEXT,
        elo         TEXT,
        observacoes TEXT,
        deletedAt   TEXT,
        pastaId     INTEGER
      );
      INSERT INTO accounts_new SELECT id, login, senha, nick, elo, observacoes, deletedAt, pastaId FROM accounts;
      DROP TABLE accounts;
      ALTER TABLE accounts_new RENAME TO accounts;
    `);
  }
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
function exportAccounts(ids) {
  if (ids.length === 0) return "";
  const placeholders = ids.map(() => "?").join(",");
  const rows = db.prepare(`SELECT login, senha FROM accounts WHERE id IN (${placeholders})`).all(...ids);
  return rows.map((r) => `${r.login}:${r.senha}`).join("\n");
}
function createWindow() {
  const win = new electron.BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    icon: path.join(__dirname, "../assets/cutekass.png"),
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
const configPath = path.join(electron.app.getPath("userData"), "config.json");
function loadConfig() {
  if (!fs.existsSync(configPath)) return { riotApiKey: "", riotClientPath: "" };
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    return { riotApiKey: "", riotClientPath: "", ...JSON.parse(raw) };
  } catch {
    return { riotApiKey: "", riotClientPath: "" };
  }
}
function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data), "utf-8");
}
let riotApiKey = loadConfig().riotApiKey;
let riotClientPath = loadConfig().riotClientPath;
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
electron.ipcMain.handle("export-accounts", (_e, ids) => {
  const conteudo = exportAccounts(ids);
  const downloadsPath = electron.app.getPath("downloads");
  const fileName = `contas_${Date.now()}.txt`;
  fs.writeFileSync(path.join(downloadsPath, fileName), conteudo, "utf-8");
});
electron.ipcMain.handle("get-riot-key", () => riotApiKey);
electron.ipcMain.handle("save-riot-key", (_e, key) => {
  riotApiKey = key.trim();
  saveConfig({ riotApiKey, riotClientPath });
});
electron.ipcMain.handle("get-riot-client-path", () => riotClientPath);
electron.ipcMain.handle("save-riot-client-path", (_e, path2) => {
  riotClientPath = path2.trim();
  saveConfig({ riotApiKey, riotClientPath });
});
electron.ipcMain.handle("fetch-elo", async (_e, nick) => {
  if (!riotApiKey) throw new Error("Chave da Riot não configurada.");
  const [gameName, tagLine] = nick.split("#");
  if (!gameName || !tagLine) throw new Error("Nick deve estar no formato Nome#TAG");
  async function riotFetch(url) {
    return new Promise((resolve, reject) => {
      const req = electron.net.request({ url, method: "GET" });
      req.setHeader("X-Riot-Token", riotApiKey);
      let body = "";
      req.on("response", (res) => {
        res.on("data", (chunk) => {
          body += chunk.toString();
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error("Resposta inválida"));
          }
        });
      });
      req.on("error", reject);
      req.end();
    });
  }
  const encodedName = encodeURIComponent(gameName);
  const encodedTag = encodeURIComponent(tagLine);
  const urlAccount = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`;
  const accountData = await riotFetch(urlAccount);
  if (accountData.status)
    throw new Error(
      `Conta não encontrada (${accountData.status.status_code}: ${accountData.status.message})`
    );
  if (!accountData.puuid) throw new Error("Conta não encontrada.");
  const urlLeague = `https://br1.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}`;
  const leagueRaw = await riotFetch(urlLeague);
  if (!Array.isArray(leagueRaw)) {
    const err = leagueRaw;
    throw new Error(
      err.status ? `Erro ao buscar elo (${err.status.status_code}: ${err.status.message})` : "Resposta inesperada da API"
    );
  }
  const leagueData = leagueRaw;
  const soloQ = leagueData.find((e) => e.queueType === "RANKED_SOLO_5x5");
  if (!soloQ) return "Unranked";
  const tierPt = {
    IRON: "Ferro",
    BRONZE: "Bronze",
    SILVER: "Prata",
    GOLD: "Ouro",
    PLATINUM: "Platina",
    EMERALD: "Esmeralda",
    DIAMOND: "Diamante",
    MASTER: "Mestre",
    GRANDMASTER: "Grão-Mestre",
    CHALLENGER: "Desafiante"
  };
  const rankPt = { I: "I", II: "II", III: "III", IV: "IV" };
  const tier = tierPt[soloQ.tier] ?? soloQ.tier;
  const rank = rankPt[soloQ.rank] ?? soloQ.rank;
  const lp = soloQ.leaguePoints;
  const altoElo = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(soloQ.tier);
  return altoElo ? `${tier} ${lp}LP` : `${tier} ${rank} ${lp}LP`;
});
electron.ipcMain.handle("login-riot", async (_e, login, senha) => {
  const { execSync, execFileSync } = await import("child_process");
  const { writeFileSync: fsWrite, unlinkSync, existsSync: fsExistsSync } = await import("fs");
  const { tmpdir } = await import("os");
  const { join: pathJoin } = await import("path");
  const loginEscapado = login.replace(/'/g, "''");
  const senhaEscapada = senha.replace(/'/g, "''");
  const checkFile = pathJoin(tmpdir(), `lol-check-${Date.now()}.ps1`);
  let clientAberto = "0";
  try {
    fsWrite(
      checkFile,
      `Get-Process -Name "Riot Client" -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count`,
      "utf-8"
    );
    clientAberto = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${checkFile}"`, {
      windowsHide: true,
      encoding: "utf-8"
    }).trim();
  } finally {
    try {
      unlinkSync(checkFile);
    } catch {
    }
  }
  if (clientAberto === "0") {
    if (!riotClientPath || !fsExistsSync(riotClientPath)) {
      throw new Error(
        "Riot Client não está aberto. Configure o caminho do executável nas Configurações para abri-lo automaticamente."
      );
    }
    execFileSync(riotClientPath, { windowsHide: false });
    execSync('powershell -NoProfile -Command "Start-Sleep -Seconds 8"', { windowsHide: true });
  }
  const script = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

$procs = Get-Process -Name "Riot Client" -ErrorAction SilentlyContinue
if (-not $procs) { throw "Riot Client nao encontrado. Abra o client e tente novamente." }

$proc = $procs | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $proc) { throw "Janela do Riot Client nao encontrada. Verifique se o client esta aberto." }

$hwnd = $proc.MainWindowHandle
[Win32]::ShowWindow($hwnd, 9)
[Win32]::SetForegroundWindow($hwnd)
Start-Sleep -Milliseconds 800

Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait('${loginEscapado}')
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait('{TAB}')
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait('${senhaEscapada}')
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
`;
  const tmpFile = pathJoin(tmpdir(), `lol-login-${Date.now()}.ps1`);
  try {
    fsWrite(tmpFile, script, "utf-8");
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tmpFile}"`, {
      windowsHide: true,
      encoding: "utf-8"
    });
  } catch (e) {
    const err = e;
    throw new Error(err.stderr || err.message || "Erro desconhecido");
  } finally {
    try {
      unlinkSync(tmpFile);
    } catch {
    }
  }
});
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
