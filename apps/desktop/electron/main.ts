import { app, BrowserWindow, ipcMain, clipboard, net, shell } from 'electron';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path, { join } from 'path';
import https from 'https';
import { autoUpdater } from 'electron-updater';
import {
  emptyTrash,
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
  exportAccounts,
  gerarBackup,
  addAccountsBulk,
  reorderAccounts,
  salvarHistoricoBackup,
  listarHistoricoBackup,
  reorderPastas,
} from '../src/lib/db';

// ─── Janela ───────────────────────────────────────────────────────────────────

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 700,
    minHeight: 500,
    autoHideMenuBar: true,
    icon: join(__dirname, '../assets/cutekass.ico'),
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

  if (app.isPackaged) {
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;

    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'yannevic',
      repo: 'cutekass',
    });

    autoUpdater.on('update-available', () => {
      win.webContents.send('update-available');
    });

    autoUpdater.on('update-not-available', () => {
      win.webContents.send('update-not-available');
    });

    autoUpdater.on('update-downloaded', () => {
      win.webContents.send('update-downloaded');
    });

    autoUpdater.on('error', (err) => {
      win.webContents.send('update-error', err.message);
    });

    // Aguarda a janela carregar para garantir que o React já montou
    // o UpdateNotifier e registrou os listeners antes de disparar eventos
    win.webContents.on('did-finish-load', () => {
      autoUpdater.checkForUpdates();
      setInterval(
        () => {
          autoUpdater.checkForUpdates();
        },
        60 * 60 * 1000
      );
    });
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const configPath = join(app.getPath('userData'), 'config.json');

interface Config {
  riotApiKey: string;
  riotClientPath: string;
}

function loadConfig(): Config {
  if (!existsSync(configPath)) return { riotApiKey: '', riotClientPath: '' };
  try {
    const raw = readFileSync(configPath, 'utf-8');
    return { riotApiKey: '', riotClientPath: '', ...JSON.parse(raw) };
  } catch {
    return { riotApiKey: '', riotClientPath: '' };
  }
}

function saveConfig(data: Config) {
  writeFileSync(configPath, JSON.stringify(data), 'utf-8');
}

let riotApiKey = loadConfig().riotApiKey;
let riotClientPath = loadConfig().riotClientPath;

function salvarBackup() {
  try {
    const conteudo = gerarBackup();
    const backupPath = app.isPackaged
      ? join(path.dirname(app.getPath('exe')), 'backup_contas.txt')
      : join(app.getPath('userData'), 'backup_contas.txt');
    writeFileSync(backupPath, conteudo, 'utf-8');
    salvarHistoricoBackup();
  } catch {
    // silencioso — backup é secundário
  }
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('open-external', (_, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle('check-for-updates', () => {
  if (app.isPackaged) autoUpdater.checkForUpdates();
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.handle('get-accounts', () => listAccounts());
ipcMain.handle('get-trash', () => listTrash());

ipcMain.handle('add-account', (_e, data) => {
  const resultado = addAccount(data);
  salvarBackup();
  return resultado;
});

ipcMain.handle('update-account', (_e, data) => {
  updateAccount(data);
  salvarBackup();
});

ipcMain.handle('delete-account', (_e, id) => {
  softDeleteAccount(id);
  salvarBackup();
});

ipcMain.handle('restore-account', (_e, id) => {
  restoreAccount(id);
  salvarBackup();
});

ipcMain.handle('permanent-delete', (_e, id) => {
  hardDeleteAccount(id);
  salvarBackup();
});

ipcMain.handle('bulk-add-accounts', (_e, dados) => {
  addAccountsBulk(dados);
  salvarBackup();
});

ipcMain.handle('bulk-delete', (_e, ids: number[]) => {
  bulkSoftDelete(ids);
  salvarBackup();
});

ipcMain.handle('bulk-set-elo', (_e, ids: number[], elo: string) => {
  bulkSetElo(ids, elo);
  salvarBackup();
});

ipcMain.handle('bulk-move-pasta', (_e, ids: number[], pastaId: number | null) => {
  bulkMovePasta(ids, pastaId);
  salvarBackup();
});

ipcMain.handle('export-accounts', (_e, ids: number[]) => {
  const conteudo = exportAccounts(ids);
  if (!conteudo) return;
  const downloadsPath = app.getPath('downloads');
  const fileName = 'contas.txt';
  const filePath = join(downloadsPath, fileName);
  writeFileSync(filePath, conteudo, 'utf-8');
  shell.showItemInFolder(filePath);
  return fileName;
});

ipcMain.handle('empty-trash', () => {
  emptyTrash();
  salvarBackup();
});

ipcMain.handle('get-pastas', () => listPastas());
ipcMain.handle('add-pasta', (_e, nome: string, cor: string, icone: string) =>
  addPasta(nome, cor, icone)
);
ipcMain.handle('update-pasta', (_e, id: number, nome: string, cor: string, icone: string) =>
  updatePasta(id, nome, cor, icone)
);
ipcMain.handle('delete-pasta', (_e, id: number) => deletePasta(id));
ipcMain.handle('reorder-pastas', (_e, ids: number[]) => reorderPastas(ids));

ipcMain.handle('copy-to-clipboard', (_e, text: string) => {
  clipboard.writeText(text);
});

ipcMain.handle('reorder-accounts', (_e, ids: number[]) => {
  reorderAccounts(ids);
});

ipcMain.handle('listar-historico-backup', () => listarHistoricoBackup());

// ─── Riot API ─────────────────────────────────────────────────────────────────

ipcMain.handle('get-riot-key', () => riotApiKey);

ipcMain.handle('save-riot-key', (_e, key: string) => {
  riotApiKey = key.trim();
  saveConfig({ riotApiKey, riotClientPath });
});

ipcMain.handle('get-riot-client-path', () => riotClientPath);

ipcMain.handle('save-riot-client-path', (_e, path: string) => {
  riotClientPath = path.trim();
  saveConfig({ riotApiKey, riotClientPath });
});

ipcMain.handle('fetch-elo', async (_e, nick: string) => {
  if (!riotApiKey) throw new Error('Chave da Riot não configurada.');

  const [gameName, tagLine] = nick.split('#');
  if (!gameName || !tagLine) throw new Error('Nick deve estar no formato Nome#TAG');

  async function riotFetch(url: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const req = net.request({ url, method: 'GET' });
      req.setHeader('X-Riot-Token', riotApiKey);
      let body = '';
      req.on('response', (res) => {
        res.on('data', (chunk) => {
          body += chunk.toString();
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error('Resposta inválida'));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  const encodedName = encodeURIComponent(gameName);
  const encodedTag = encodeURIComponent(tagLine);
  const urlAccount = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedName}/${encodedTag}`;

  const accountData = (await riotFetch(urlAccount)) as {
    puuid?: string;
    status?: { message: string; status_code: number };
  };

  if (accountData.status)
    throw new Error(
      `Conta não encontrada (${accountData.status.status_code}: ${accountData.status.message})`
    );
  if (!accountData.puuid) throw new Error('Conta não encontrada.');

  const urlLeague = `https://br1.api.riotgames.com/lol/league/v4/entries/by-puuid/${accountData.puuid}`;
  const leagueRaw = await riotFetch(urlLeague);

  if (!Array.isArray(leagueRaw)) {
    const err = leagueRaw as { status?: { message: string; status_code: number } };
    throw new Error(
      err.status
        ? `Erro ao buscar elo (${err.status.status_code}: ${err.status.message})`
        : 'Resposta inesperada da API'
    );
  }

  const leagueData = leagueRaw as {
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
  }[];
  const soloQ = leagueData.find((e) => e.queueType === 'RANKED_SOLO_5x5');

  if (!soloQ) return 'Unranked';

  const tierPt: Record<string, string> = {
    IRON: 'Ferro',
    BRONZE: 'Bronze',
    SILVER: 'Prata',
    GOLD: 'Ouro',
    PLATINUM: 'Platina',
    EMERALD: 'Esmeralda',
    DIAMOND: 'Diamante',
    MASTER: 'Mestre',
    GRANDMASTER: 'Grão-Mestre',
    CHALLENGER: 'Desafiante',
  };
  const rankPt: Record<string, string> = { I: 'I', II: 'II', III: 'III', IV: 'IV' };

  const tier = tierPt[soloQ.tier] ?? soloQ.tier;
  const rank = rankPt[soloQ.rank] ?? soloQ.rank;
  const lp = soloQ.leaguePoints;

  const altoElo = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(soloQ.tier);
  return {
    elo: altoElo ? `${tier} ${lp}LP` : `${tier} ${rank} ${lp}LP`,
    wins: soloQ.wins,
    losses: soloQ.losses,
  };
});

ipcMain.handle('login-riot', async (_e, login: string, senha: string) => {
  const { execSync, spawn } = await import('child_process');
  const { writeFileSync: fsWrite, unlinkSync, existsSync: fsExistsSync } = await import('fs');
  const { tmpdir } = await import('os');
  const { join: pathJoin } = await import('path');

  const loginEscapado = login.replace(/'/g, "''");
  const senhaEscapada = senha.replace(/'/g, "''");

  // Verifica se o client está aberto
  const checkFile = pathJoin(tmpdir(), `lol-check-${Date.now()}.ps1`);
  let clientAberto = '0';
  try {
    fsWrite(
      checkFile,
      `Get-Process -Name "Riot Client" -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count`,
      'utf-8'
    );
    clientAberto = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${checkFile}"`, {
      windowsHide: true,
      encoding: 'utf-8',
    }).trim();
  } finally {
    try {
      unlinkSync(checkFile);
    } catch {
      /* ignora */
    }
  }

  // Abre o client sem bloquear se não estiver aberto
  if (clientAberto === '0') {
    if (!riotClientPath || !fsExistsSync(riotClientPath)) {
      throw new Error(
        'Riot Client não está aberto. Configure o caminho do executável nas Configurações para abri-lo automaticamente.'
      );
    }
    spawn(riotClientPath, [], { detached: true, stdio: 'ignore' }).unref();
    // Espera sem bloquear o processo principal
    await new Promise((resolve) => setTimeout(resolve, 8000));
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
[System.Windows.Forms.SendKeys]::SendWait('^a')
[System.Windows.Forms.SendKeys]::SendWait('{DELETE}')
Start-Sleep -Milliseconds 150
[System.Windows.Forms.SendKeys]::SendWait('${loginEscapado}')
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait('{TAB}')
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait('^a')
[System.Windows.Forms.SendKeys]::SendWait('{DELETE}')
Start-Sleep -Milliseconds 150
[System.Windows.Forms.SendKeys]::SendWait('${senhaEscapada}')
Start-Sleep -Milliseconds 300
[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
`;

  const tmpFile = pathJoin(tmpdir(), `lol-login-${Date.now()}.ps1`);
  try {
    fsWrite(tmpFile, script, 'utf-8');
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${tmpFile}"`, {
      windowsHide: true,
      encoding: 'utf-8',
      timeout: 15000,
    });
  } catch (e: unknown) {
    const err = e as { message?: string; stderr?: string };
    throw new Error(err.stderr || err.message || 'Erro desconhecido');
  } finally {
    try {
      unlinkSync(tmpFile);
    } catch {
      /* ignora */
    }
  }
});

// ─── LCU API ──────────────────────────────────────────────────────────────────

ipcMain.handle('fetch-lcu-data', async () => {
  const { execSync } = await import('child_process');
  const { readFileSync: fsRead, existsSync: fsExists } = await import('fs');
  const { join: pJoin } = await import('path');

  let lockfilePath = '';

  // Tentativa 1: busca pelo processo LeagueClient via PowerShell
  try {
    const resultado = execSync(
      `powershell -NoProfile -Command "Get-Process LeagueClient -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Path"`,
      { windowsHide: true, encoding: 'utf-8', timeout: 5000 }
    ).trim();

    if (resultado) {
      // resultado é o caminho do .exe — o lockfile fica 2 pastas acima
      const pastaLol = pJoin(resultado, '..', '..');
      const candidato = pJoin(pastaLol, 'lockfile');
      if (fsExists(candidato)) lockfilePath = candidato;
    }
  } catch {
    // segue para próxima tentativa
  }

  // Tentativa 2: deriva do riotClientPath salvo (troca RiotClient pelo LoL)
  if (!lockfilePath && riotClientPath) {
    const pastaRiotGames = pJoin(riotClientPath, '..', '..', '..');
    const candidato = pJoin(pastaRiotGames, 'League of Legends', 'lockfile');
    if (fsExists(candidato)) lockfilePath = candidato;
  }

  // Tentativa 3: caminhos padrão
  if (!lockfilePath) {
    const programFiles = process.env['ProgramFiles'] ?? 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] ?? 'C:\\Program Files (x86)';

    const candidatos = [
      pJoin('C:\\', 'Riot Games', 'League of Legends', 'lockfile'),
      pJoin('E:\\', 'Riot Games', 'League of Legends', 'lockfile'),
      pJoin(programFiles, 'Riot Games', 'League of Legends', 'lockfile'),
      pJoin(programFilesX86, 'Riot Games', 'League of Legends', 'lockfile'),
    ];

    const encontrado = candidatos.find((c) => fsExists(c));
    if (encontrado) lockfilePath = encontrado;
  }

  if (!lockfilePath) {
    throw new Error(
      'Lockfile não encontrado. Verifique se o League of Legends está aberto e logado.'
    );
  }

  // lockfile formato: name:pid:port:password:protocol
  const partes = fsRead(lockfilePath, 'utf-8').split(':');
  const porta = partes[2];
  const senha = partes[3];
  const auth = Buffer.from(`riot:${senha}`).toString('base64');

  async function lcuGet(endpoint: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: porta,
        path: endpoint,
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
        rejectUnauthorized: false, // ignora certificado autoassinado da LCU
      };

      const req = https.request(options, (res: import('http').IncomingMessage) => {
        let body = '';
        res.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            reject(new Error('Resposta inválida da LCU'));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  const [summoner, wallet, campeoes, skins] = await Promise.all([
    lcuGet('/lol-summoner/v1/current-summoner'),
    lcuGet('/lol-inventory/v1/wallet/balance'),
    lcuGet('/lol-champions/v1/owned-champions-minimal'),
    lcuGet('/lol-inventory/v2/inventory/CHAMPION_SKIN'),
  ]);

  const s = summoner as { summonerLevel?: number; gameName?: string; tagLine?: string };
  const w = wallet as Record<string, number>;
  const nivel = s.summonerLevel ?? 0;
  const nickLcu = s.gameName && s.tagLine ? `${s.gameName}#${s.tagLine}` : '';
  const essenciaAzul = w['lol_blue_essence'] ?? 0;
  const essenciaLaranja = w['lol_orange_essence'] ?? 0;
  const numCampeoes = Array.isArray(campeoes)
    ? (campeoes as { ownership?: { owned?: boolean } }[]).filter((c) => c.ownership?.owned).length
    : 0;

  const skinsData = await lcuGet('/lol-game-data/assets/v1/skins.json').catch(() => ({}));
  const skinsMap = skinsData as Record<string, { isBase?: boolean }>;

  const skinsRaw = Array.isArray(skins)
    ? (skins as { owned?: boolean; itemId?: number }[]).filter((sk) => {
        if (!sk.owned || sk.itemId === undefined) return false;
        const dadosSkin = skinsMap[String(sk.itemId)];
        if (!dadosSkin) return false;
        if (dadosSkin.isBase) return false;
        return true;
      })
    : [];

  const skinsNomes = skinsRaw
    .map((sk) => {
      const dadosSkin = skinsMap[String(sk.itemId)] as { name?: string } | undefined;
      return dadosSkin?.name ?? '';
    })
    .filter((nome) => nome !== '');

  return {
    nivel,
    essenciaAzul,
    essenciaLaranja,
    numCampeoes,
    numSkins: skinsRaw.length,
    skinsNomes,
    nick: nickLcu,
  };
});

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
