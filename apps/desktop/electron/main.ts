import { app, BrowserWindow, ipcMain, clipboard, net } from 'electron';
import { writeFileSync, readFileSync, existsSync } from 'fs';
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
  exportAccounts,
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
ipcMain.handle('export-accounts', (_e, ids: number[]) => {
  const conteudo = exportAccounts(ids);
  const downloadsPath = app.getPath('downloads');
  const fileName = `contas_${Date.now()}.txt`;
  writeFileSync(join(downloadsPath, fileName), conteudo, 'utf-8');
});

// ─── Riot API ─────────────────────────────────────────────────────────────────

const configPath = join(app.getPath('userData'), 'config.json');

function loadConfig(): { riotApiKey: string } {
  if (!existsSync(configPath)) return { riotApiKey: '' };
  try {
    const raw = readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { riotApiKey: '' };
  }
}

function saveConfig(data: { riotApiKey: string }) {
  writeFileSync(configPath, JSON.stringify(data), 'utf-8');
}

let riotApiKey = loadConfig().riotApiKey;

ipcMain.handle('get-riot-key', () => riotApiKey);

ipcMain.handle('save-riot-key', (_e, key: string) => {
  riotApiKey = key.trim();
  saveConfig({ riotApiKey });
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

  // 1. PUUID via account-v1
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

  // 2. Elo via league-v4 direto pelo puuid
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
  return altoElo ? `${tier} ${lp}LP` : `${tier} ${rank} ${lp}LP`;
});

// ─── Ciclo de vida ────────────────────────────────────────────────────────────

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
