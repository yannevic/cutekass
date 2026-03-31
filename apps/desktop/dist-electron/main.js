"use strict";var F=Object.create;var D=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var H=Object.getOwnPropertyNames;var x=Object.getPrototypeOf,j=Object.prototype.hasOwnProperty;var X=(e,t,o,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of H(t))!j.call(e,r)&&r!==o&&D(e,r,{get:()=>t[r],enumerable:!(i=v(t,r))||i.enumerable});return e};var f=(e,t,o)=>(o=e!=null?F(x(e)):{},X(t||!e||!e.__esModule?D(o,"default",{value:e,enumerable:!0}):o,e));const n=require("electron"),m=require("fs"),d=require("path"),G=require("better-sqlite3"),B=d.join(n.app.getPath("userData"),"accounts.db"),W=n.app.isPackaged?d.join(process.resourcesPath,"better_sqlite3.node"):void 0,a=new G(B,W?{nativeBinding:W}:void 0);a.exec(`
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
`);try{a.exec("ALTER TABLE accounts ADD COLUMN pastaId INTEGER")}catch{}try{const e=a.prepare("PRAGMA table_info(accounts)").all().find(t=>t.name==="nick");(e==null?void 0:e.notnull)===1&&a.exec(`
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
    `)}catch{}function K(){return a.prepare("SELECT * FROM accounts WHERE deletedAt IS NULL").all()}function V(){return a.prepare("SELECT * FROM accounts WHERE deletedAt IS NOT NULL").all()}function q(e){const t=a.prepare(`
    INSERT INTO accounts (login, senha, nick, elo, observacoes, deletedAt, pastaId)
    VALUES (@login, @senha, @nick, @elo, @observacoes, @deletedAt, @pastaId)
  `),o={login:e.login,senha:e.senha,nick:e.nick??null,elo:e.elo??null,observacoes:e.observacoes??null,deletedAt:e.deletedAt??null,pastaId:e.pastaId??null};return{id:t.run(o).lastInsertRowid,...e}}function Y(e){a.prepare(`
    UPDATE accounts
    SET login = @login, senha = @senha, nick = @nick,
        elo = @elo, observacoes = @observacoes, pastaId = @pastaId
    WHERE id = @id
  `).run({id:e.id,login:e.login,senha:e.senha,nick:e.nick??null,elo:e.elo??null,observacoes:e.observacoes??null,pastaId:e.pastaId??null})}function J(e){a.prepare("UPDATE accounts SET deletedAt = @deletedAt WHERE id = @id").run({deletedAt:new Date().toISOString(),id:e})}function z(e){a.prepare("UPDATE accounts SET deletedAt = NULL WHERE id = @id").run({id:e})}function Q(e){a.prepare("DELETE FROM accounts WHERE id = @id").run({id:e})}function Z(e){if(e.length===0)return;const t=e.map(()=>"?").join(",");a.prepare(`UPDATE accounts SET deletedAt = ? WHERE id IN (${t})`).run(new Date().toISOString(),...e)}function ee(e,t){if(e.length===0)return;const o=e.map(()=>"?").join(",");a.prepare(`UPDATE accounts SET elo = ? WHERE id IN (${o})`).run(t,...e)}function te(e,t){if(e.length===0)return;const o=e.map(()=>"?").join(",");a.prepare(`UPDATE accounts SET pastaId = ? WHERE id IN (${o})`).run(t,...e)}function ne(){return a.prepare("SELECT * FROM pastas ORDER BY id ASC").all()}function oe(e,t){return{id:a.prepare("INSERT INTO pastas (nome, cor) VALUES (@nome, @cor)").run({nome:e,cor:t}).lastInsertRowid,nome:e,cor:t}}function ae(e,t,o){a.prepare("UPDATE pastas SET nome = @nome, cor = @cor WHERE id = @id").run({id:e,nome:t,cor:o})}function ie(e){a.prepare("UPDATE accounts SET pastaId = NULL WHERE pastaId = @id").run({id:e}),a.prepare("DELETE FROM pastas WHERE id = @id").run({id:e})}function re(e){if(e.length===0)return"";const t=e.map(()=>"?").join(",");return a.prepare(`SELECT login, senha FROM accounts WHERE id IN (${t})`).all(...e).map(i=>`${i.login}:${i.senha}`).join(`
`)}function _(){const e=new n.BrowserWindow({width:900,height:650,minWidth:700,minHeight:500,icon:d.join(__dirname,"../assets/cutekass.ico"),webPreferences:{preload:d.join(__dirname,"preload.js"),contextIsolation:!0,nodeIntegration:!1}});process.env.VITE_DEV_SERVER_URL?e.loadURL(process.env.VITE_DEV_SERVER_URL):e.loadFile(d.join(__dirname,"../dist/index.html"))}const L=d.join(n.app.getPath("userData"),"config.json");function C(){if(!m.existsSync(L))return{riotApiKey:"",riotClientPath:""};try{const e=m.readFileSync(L,"utf-8");return{riotApiKey:"",riotClientPath:"",...JSON.parse(e)}}catch{return{riotApiKey:"",riotClientPath:""}}}function $(e){m.writeFileSync(L,JSON.stringify(e),"utf-8")}let E=C().riotApiKey,p=C().riotClientPath;n.ipcMain.handle("get-accounts",()=>K());n.ipcMain.handle("get-trash",()=>V());n.ipcMain.handle("add-account",(e,t)=>q(t));n.ipcMain.handle("update-account",(e,t)=>Y(t));n.ipcMain.handle("delete-account",(e,t)=>J(t));n.ipcMain.handle("restore-account",(e,t)=>z(t));n.ipcMain.handle("permanent-delete",(e,t)=>Q(t));n.ipcMain.handle("copy-to-clipboard",(e,t)=>{n.clipboard.writeText(t)});n.ipcMain.handle("bulk-delete",(e,t)=>Z(t));n.ipcMain.handle("bulk-set-elo",(e,t,o)=>ee(t,o));n.ipcMain.handle("bulk-move-pasta",(e,t,o)=>te(t,o));n.ipcMain.handle("get-pastas",()=>ne());n.ipcMain.handle("add-pasta",(e,t,o)=>oe(t,o));n.ipcMain.handle("update-pasta",(e,t,o,i)=>ae(t,o,i));n.ipcMain.handle("delete-pasta",(e,t)=>ie(t));n.ipcMain.handle("export-accounts",(e,t)=>{const o=re(t),i=n.app.getPath("downloads"),r=`contas_${Date.now()}.txt`;m.writeFileSync(d.join(i,r),o,"utf-8")});n.ipcMain.handle("get-riot-key",()=>E);n.ipcMain.handle("save-riot-key",(e,t)=>{E=t.trim(),$({riotApiKey:E,riotClientPath:p})});n.ipcMain.handle("get-riot-client-path",()=>p);n.ipcMain.handle("save-riot-client-path",(e,t)=>{p=t.trim(),$({riotApiKey:E,riotClientPath:p})});n.ipcMain.handle("fetch-elo",async(e,t)=>{if(!E)throw new Error("Chave da Riot não configurada.");const[o,i]=t.split("#");if(!o||!i)throw new Error("Nick deve estar no formato Nome#TAG");async function r(l){return new Promise((k,P)=>{const I=n.net.request({url:l,method:"GET"});I.setHeader("X-Riot-Token",E);let b="";I.on("response",O=>{O.on("data",U=>{b+=U.toString()}),O.on("end",()=>{try{k(JSON.parse(b))}catch{P(new Error("Resposta inválida"))}})}),I.on("error",P),I.end()})}const S=encodeURIComponent(o),w=encodeURIComponent(i),g=`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${S}/${w}`,c=await r(g);if(c.status)throw new Error(`Conta não encontrada (${c.status.status_code}: ${c.status.message})`);if(!c.puuid)throw new Error("Conta não encontrada.");const A=`https://br1.api.riotgames.com/lol/league/v4/entries/by-puuid/${c.puuid}`,T=await r(A);if(!Array.isArray(T)){const l=T;throw new Error(l.status?`Erro ao buscar elo (${l.status.status_code}: ${l.status.message})`:"Resposta inesperada da API")}const s=T.find(l=>l.queueType==="RANKED_SOLO_5x5");if(!s)return"Unranked";const R={IRON:"Ferro",BRONZE:"Bronze",SILVER:"Prata",GOLD:"Ouro",PLATINUM:"Platina",EMERALD:"Esmeralda",DIAMOND:"Diamante",MASTER:"Mestre",GRANDMASTER:"Grão-Mestre",CHALLENGER:"Desafiante"},N={I:"I",II:"II",III:"III",IV:"IV"},u=R[s.tier]??s.tier,y=N[s.rank]??s.rank,h=s.leaguePoints;return["MASTER","GRANDMASTER","CHALLENGER"].includes(s.tier)?`${u} ${h}LP`:`${u} ${y} ${h}LP`});n.ipcMain.handle("login-riot",async(e,t,o)=>{const{execSync:i,execFileSync:r}=await import("child_process"),{writeFileSync:S,unlinkSync:w,existsSync:g}=await import("fs"),{tmpdir:c}=await import("os"),{join:A}=await import("path"),T=t.replace(/'/g,"''"),M=o.replace(/'/g,"''"),s=A(c(),`lol-check-${Date.now()}.ps1`);let R="0";try{S(s,'Get-Process -Name "Riot Client" -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count',"utf-8"),R=i(`powershell -NoProfile -ExecutionPolicy Bypass -File "${s}"`,{windowsHide:!0,encoding:"utf-8"}).trim()}finally{try{w(s)}catch{}}if(R==="0"){if(!p||!g(p))throw new Error("Riot Client não está aberto. Configure o caminho do executável nas Configurações para abri-lo automaticamente.");r(p,{windowsHide:!1}),i('powershell -NoProfile -Command "Start-Sleep -Seconds 8"',{windowsHide:!0})}const N=`
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
[System.Windows.Forms.SendKeys]::SendWait('${T}')
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait('{TAB}')
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait('${M}')
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
`,u=A(c(),`lol-login-${Date.now()}.ps1`);try{S(u,N,"utf-8"),i(`powershell -NoProfile -ExecutionPolicy Bypass -File "${u}"`,{windowsHide:!0,encoding:"utf-8"})}catch(y){const h=y;throw new Error(h.stderr||h.message||"Erro desconhecido")}finally{try{w(u)}catch{}}});n.app.whenReady().then(_);n.app.on("window-all-closed",()=>{process.platform!=="darwin"&&n.app.quit()});n.app.on("activate",()=>{n.BrowserWindow.getAllWindows().length===0&&_()});
