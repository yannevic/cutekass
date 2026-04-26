import { app, BrowserWindow, ipcMain, clipboard, net, shell } from 'electron';
import { createCipheriv, randomBytes, pbkdf2Sync } from 'crypto';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path, { join } from 'path';
import https from 'https';
import { autoUpdater } from 'electron-updater';
import {
  inicializarDb,
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
    frame: false,
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

  ipcMain.on('win-minimize', () => win.minimize());
  ipcMain.on('win-maximize', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.on('win-close', () => win.close());
  ipcMain.handle('get-version', () => app.getVersion());

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
  if (typeof url === 'string' && url.startsWith('https://')) {
    shell.openExternal(url);
  }
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

ipcMain.handle('export-accounts-encrypted', (_e, ids: number[], senha: string) => {
  if (typeof senha !== 'string' || senha.trim().length === 0) {
    throw new Error('Senha inválida.');
  }
  const conteudo = exportAccounts(ids);
  if (!conteudo) return;

  const salt = randomBytes(16);
  const key = pbkdf2Sync(senha.trim(), salt, 100000, 32, 'sha256');
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(conteudo, 'utf-8'), cipher.final()]);
  const resultado = Buffer.concat([salt, iv, encrypted]);

  const downloadsPath = app.getPath('downloads');
  const filePath = join(downloadsPath, 'contas_seguro.enc');
  writeFileSync(filePath, resultado);
  shell.showItemInFolder(filePath);
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

ipcMain.handle('save-riot-key', (_e, key: unknown) => {
  if (typeof key !== 'string') return;
  riotApiKey = key.trim().slice(0, 200);
  saveConfig({ riotApiKey, riotClientPath });
});
ipcMain.handle('get-riot-client-path', () => riotClientPath);

ipcMain.handle('save-riot-client-path', (_e, clientPath: unknown) => {
  if (typeof clientPath !== 'string') return;
  riotClientPath = clientPath.trim().slice(0, 500);
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

// ─── Gerador de colagem de skins ──────────────────────────────────────────────

ipcMain.handle(
  'gerar-colagem-skins',
  async (_e, skinsNomes: string[], nick: string, idioma: string) => {
    const { join: pJoin } = await import('path');
    const { writeFileSync: fsWrite, mkdirSync } = await import('fs');

    function httpsGetStr(url: string): Promise<string> {
      return new Promise((resolve, reject) => {
        https
          .get(url, (res) => {
            let data = '';
            res.on('data', (chunk: Buffer) => {
              data += chunk.toString();
            });
            res.on('end', () => resolve(data));
            res.on('error', reject);
          })
          .on('error', reject);
      });
    }

    // 1. Versão mais recente do Data Dragon
    const versoesRaw = await httpsGetStr('https://ddragon.leagueoflegends.com/api/versions.json');
    const versoes = JSON.parse(versoesRaw) as string[];
    const versao = versoes[0];

    // 2. JSON completo de campeões e skins
    const idiomaValido =
      typeof idioma === 'string' && /^[a-z]{2}_[A-Z]{2}$/.test(idioma) ? idioma : 'pt_BR';
    const fullJsonRaw = await httpsGetStr(
      `https://ddragon.leagueoflegends.com/cdn/${versao}/data/${idiomaValido}/championFull.json`
    );
    const fullJson = JSON.parse(fullJsonRaw) as {
      data: Record<string, { id: string; name: string; skins: { num: number; name: string }[] }>;
    };

    // 3. Mapa nome-da-skin (lowercase) → url da splash art
    const mapaUrl: Record<string, string> = {};
    Object.values(fullJson.data).forEach((champ) => {
      champ.skins.forEach((skin) => {
        const nomeSkin = skin.num === 0 ? champ.name : skin.name;
        const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champ.id}_${skin.num}.jpg`;
        mapaUrl[nomeSkin.toLowerCase().trim()] = url;
      });
    });

    // 4. Resolve URLs das skins da conta
    const urlsResolvidas: { nome: string; url: string }[] = [];
    skinsNomes.forEach((nome) => {
      const url = mapaUrl[nome.toLowerCase().trim()];
      if (url) urlsResolvidas.push({ nome, url });
    });

    if (urlsResolvidas.length === 0) {
      throw new Error('Nenhuma skin encontrada no Data Dragon.');
    }

    // 5. Divide em páginas de 30 skins (6 colunas × 5 linhas)
    const COLUNAS = 6;
    const LARGURA = 308;
    const ALTURA = 172;
    const POR_PAGINA = 30;

    const paginas: { nome: string; url: string }[][] = [];
    for (let i = 0; i < urlsResolvidas.length; i += POR_PAGINA) {
      paginas.push(urlsResolvidas.slice(i, i + POR_PAGINA));
    }

    // 6. Cria pasta com nome da conta (# → -)
    const nomePasta = `skins_${nick.replace(/#/g, '-').replace(/[<>:"/\\|?*]/g, '_')}`;
    const downloadsPath = app.getPath('downloads');
    const pastaCaminho = pJoin(downloadsPath, nomePasta);
    mkdirSync(pastaCaminho, { recursive: true });

    // 7. Gera uma imagem por página
    const larguraTotal = COLUNAS * LARGURA;

    async function gerarPagina(
      itens: { nome: string; url: string }[],
      numeroPagina: number
    ): Promise<void> {
      const linhas = Math.ceil(itens.length / COLUNAS);
      const alturaTotal = linhas * ALTURA;

      const itensHtml = itens
        .map(
          ({ url }) =>
            `<div style="width:${LARGURA}px;height:${ALTURA}px;overflow:hidden;border:1px solid #3B136B;box-sizing:border-box;flex-shrink:0;">` +
            `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" /></div>`
        )
        .join('');

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#0B0F1A;overflow:hidden;}</style>
</head><body>
<div style="display:flex;flex-wrap:wrap;width:${larguraTotal}px;">${itensHtml}</div>
</body></html>`;

      const offscreen = new BrowserWindow({
        width: larguraTotal,
        height: alturaTotal,
        show: false,
        webPreferences: {
          offscreen: true,
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      await offscreen.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      // Aguarda imagens carregarem via onload
      await offscreen.webContents.executeJavaScript(`
      new Promise((resolve) => {
        const imgs = document.querySelectorAll('img');
        if (imgs.length === 0) { resolve(); return; }
        let pendentes = imgs.length;
        const fim = () => { pendentes -= 1; if (pendentes === 0) resolve(); };
        imgs.forEach((img) => {
          if (img.complete) { fim(); }
          else { img.onload = fim; img.onerror = fim; }
        });
        setTimeout(resolve, 60000);
      })
    `);

      // No modo offscreen o Electron só renderiza quando há um consumidor de frames.
      // Fazemos capturas de "aquecimento" até obter uma imagem não-vazia,
      // com esperas crescentes entre tentativas.
      async function capturarComRetry(): Promise<Electron.NativeImage> {
        const delays = [500, 1000, 1500, 2000, 3000];
        let ultimo: Electron.NativeImage | null = null;
        for (let t = 0; t < delays.length; t += 1) {
          await new Promise((r) => setTimeout(r, delays[t]));
          const img = await offscreen.webContents.capturePage({
            x: 0,
            y: 0,
            width: larguraTotal,
            height: alturaTotal,
          });
          ultimo = img;
          // Considera válido se o buffer JPEG tiver mais de 50KB
          if (img.toJPEG(88).length > 50 * 1024) return img;
        }
        return ultimo!;
      }

      const nativeImage = await capturarComRetry();

      offscreen.destroy();

      const nomeArquivo = `skins_${numeroPagina}.jpg`;
      fsWrite(pJoin(pastaCaminho, nomeArquivo), nativeImage.toJPEG(88));
    }

    // Gera páginas em sequência para não abrir 10 janelas ao mesmo tempo
    for (let i = 0; i < paginas.length; i += 1) {
      await gerarPagina(paginas[i], i + 1);
    }

    // 8. Abre a pasta no Explorer
    shell.openPath(pastaCaminho);

    return {
      nomePasta,
      skinsNaoEncontradas: skinsNomes.length - urlsResolvidas.length,
    };
  }
);
// ─── Ciclo de vida ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  await inicializarDb();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
