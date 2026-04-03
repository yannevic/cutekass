import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import type { Account } from '../types/account';
import type { Pasta } from '../types/pasta';

const dbPath = path.join(app.getPath('userData'), 'accounts.db');

const db = new Database(dbPath);

// ─── Schema ───────────────────────────────────────────────────────────────────

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

try {
  const col = (
    db.prepare(`PRAGMA table_info(accounts)`).all() as { name: string; notnull: number }[]
  ).find((c) => c.name === 'nick');
  if (col?.notnull === 1) {
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
  // migração já aplicada, ignorar
}
// Migração: coluna ordem
try {
  db.exec('ALTER TABLE accounts ADD COLUMN ordem INTEGER');
  // inicializa ordem pelo id para quem já tem contas
  db.exec('UPDATE accounts SET ordem = id WHERE ordem IS NULL');
} catch {
  // coluna já existe, ignorar
}

// Migração: icone nas pastas
try {
  db.exec("ALTER TABLE pastas ADD COLUMN icone TEXT NOT NULL DEFAULT 'folder'");
} catch {
  // coluna já existe, ignorar
}

// Migração: ordem nas pastas
try {
  db.exec('ALTER TABLE pastas ADD COLUMN ordem INTEGER');
  db.exec('UPDATE pastas SET ordem = id WHERE ordem IS NULL');
} catch {
  // coluna já existe, ignorar
}
// Migração: wins e losses
try {
  db.exec('ALTER TABLE accounts ADD COLUMN wins INTEGER');
  db.exec('ALTER TABLE accounts ADD COLUMN losses INTEGER');
} catch {
  // colunas já existem, ignorar
}

// Migração: dados LCU por conta
try {
  db.exec('ALTER TABLE accounts ADD COLUMN lcuNivel INTEGER');
  db.exec('ALTER TABLE accounts ADD COLUMN lcuEssenciaAzul INTEGER');
  db.exec('ALTER TABLE accounts ADD COLUMN lcuEssenciaLaranja INTEGER');
  db.exec('ALTER TABLE accounts ADD COLUMN lcuCampeoes INTEGER');
  db.exec('ALTER TABLE accounts ADD COLUMN lcuSkins INTEGER');
  db.exec('ALTER TABLE accounts ADD COLUMN lcuAtualizadoEm TEXT');
} catch {
  // colunas já existem, ignorar
}

// Tabela de histórico de backup
// Migração: lista de skins LCU
try {
  db.exec('ALTER TABLE accounts ADD COLUMN lcuSkinsLista TEXT');
} catch {
  // coluna já existe, ignorar
}
db.exec(`
  CREATE TABLE IF NOT EXISTS backup_historico (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    conteudo  TEXT NOT NULL,
    criadoEm  TEXT NOT NULL
  )
`);

// ─── Accounts ─────────────────────────────────────────────────────────────────

export function listAccounts(): Account[] {
  return db
    .prepare('SELECT * FROM accounts WHERE deletedAt IS NULL ORDER BY ordem ASC, id ASC')
    .all() as Account[];
}

export function listTrash(): Account[] {
  return db.prepare('SELECT * FROM accounts WHERE deletedAt IS NOT NULL').all() as Account[];
}

export function addAccount(data: Omit<Account, 'id'>): Account {
  const existe = db
    .prepare('SELECT id, deletedAt FROM accounts WHERE login = ?')
    .get(data.login) as { id: number; deletedAt: string | null } | undefined;
  if (existe) {
    if (existe.deletedAt !== null) {
      db.prepare('UPDATE accounts SET deletedAt = NULL WHERE id = ?').run(existe.id);
    }
    if (data.nick) {
      db.prepare('UPDATE accounts SET nick = ? WHERE id = ?').run(data.nick, existe.id);
    }
    return { id: existe.id, ...data };
  }

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
    wins: data.wins ?? null,
    losses: data.losses ?? null,
  };
  const result = stmt.run(sanitized);
  return { id: result.lastInsertRowid as number, ...data };
}

export function updateAccount(data: Account): void {
  // Verifica nick duplicado (ignora a própria conta e nicks vazios)
  if (data.nick) {
    const duplicado = db
      .prepare(
        'SELECT id FROM accounts WHERE LOWER(nick) = LOWER(?) AND id != ? AND deletedAt IS NULL'
      )
      .get(data.nick, data.id) as { id: number } | undefined;
    if (duplicado) throw new Error(`O nick ${data.nick} já está vinculado a outra conta.`);
  }

  db.prepare(
    `UPDATE accounts
     SET login = @login, senha = @senha, nick = @nick,
         elo = @elo, observacoes = @observacoes, pastaId = @pastaId, wins = @wins, losses = @losses,
         lcuNivel = @lcuNivel, lcuEssenciaAzul = @lcuEssenciaAzul, lcuEssenciaLaranja = @lcuEssenciaLaranja,
         lcuCampeoes = @lcuCampeoes, lcuSkins = @lcuSkins, lcuSkinsLista = @lcuSkinsLista, lcuAtualizadoEm = @lcuAtualizadoEm
     WHERE id = @id`
  ).run({
    id: data.id,
    login: data.login,
    senha: data.senha,
    nick: data.nick ?? null,
    elo: data.elo ?? null,
    observacoes: data.observacoes ?? null,
    pastaId: data.pastaId ?? null,
    wins: data.wins ?? null,
    losses: data.losses ?? null,
    lcuNivel: data.lcuNivel ?? null,
    lcuEssenciaAzul: data.lcuEssenciaAzul ?? null,
    lcuEssenciaLaranja: data.lcuEssenciaLaranja ?? null,
    lcuCampeoes: data.lcuCampeoes ?? null,
    lcuSkins: data.lcuSkins ?? null,
    lcuSkinsLista: data.lcuSkinsLista ?? null,
    lcuAtualizadoEm: data.lcuAtualizadoEm ?? null,
  });
}

export function softDeleteAccount(id: number): void {
  db.prepare('UPDATE accounts SET deletedAt = @deletedAt WHERE id = @id').run({
    deletedAt: new Date().toISOString(),
    id,
  });
}

export function restoreAccount(id: number): void {
  db.prepare('UPDATE accounts SET deletedAt = NULL WHERE id = @id').run({ id });
}

export function hardDeleteAccount(id: number): void {
  db.prepare('DELETE FROM accounts WHERE id = @id').run({ id });
}

// ─── Bulk ─────────────────────────────────────────────────────────────────────

export function bulkSoftDelete(ids: number[]): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE accounts SET deletedAt = ? WHERE id IN (${placeholders})`).run(
    new Date().toISOString(),
    ...ids
  );
}

export function bulkSetElo(ids: number[], elo: string): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE accounts SET elo = ? WHERE id IN (${placeholders})`).run(elo, ...ids);
}

export function bulkMovePasta(ids: number[], pastaId: number | null): void {
  if (ids.length === 0) return;
  const placeholders = ids.map(() => '?').join(',');
  db.prepare(`UPDATE accounts SET pastaId = ? WHERE id IN (${placeholders})`).run(pastaId, ...ids);
}

// ─── Pastas ───────────────────────────────────────────────────────────────────

export function listPastas(): Pasta[] {
  return db.prepare('SELECT * FROM pastas ORDER BY ordem ASC, id ASC').all() as Pasta[];
}

export function addPasta(nome: string, cor: string, icone: string): Pasta {
  const result = db
    .prepare('INSERT INTO pastas (nome, cor, icone) VALUES (@nome, @cor, @icone)')
    .run({ nome, cor, icone });
  return { id: result.lastInsertRowid as number, nome, cor, icone, ordem: 0 };
}

export function updatePasta(id: number, nome: string, cor: string, icone: string): void {
  db.prepare('UPDATE pastas SET nome = @nome, cor = @cor, icone = @icone WHERE id = @id').run({
    id,
    nome,
    cor,
    icone,
  });
}

export function reorderPastas(ids: number[]): void {
  const stmt = db.prepare('UPDATE pastas SET ordem = @ordem WHERE id = @id');
  const atualizar = db.transaction((lista: number[]) => {
    lista.forEach((id, index) => {
      stmt.run({ ordem: index, id });
    });
  });
  atualizar(ids);
}

export function deletePasta(id: number): void {
  db.prepare('UPDATE accounts SET pastaId = NULL WHERE pastaId = @id').run({ id });
  db.prepare('DELETE FROM pastas WHERE id = @id').run({ id });
}
export function exportAccounts(ids: number[]): string {
  if (ids.length === 0) return '';
  const placeholders = ids.map(() => '?').join(',');
  const rows = db
    .prepare(`SELECT login, senha, nick FROM accounts WHERE id IN (${placeholders})`)
    .all(...ids) as { login: string; senha: string; nick: string | null }[];
  return rows
    .map((r) => {
      const nickPart = r.nick ? ` ${r.nick}` : '';
      return `${r.login}:${r.senha}${nickPart}`;
    })
    .join('\n');
}
export function gerarBackup(): string {
  const rows = db
    .prepare('SELECT login, senha, nick FROM accounts WHERE deletedAt IS NULL')
    .all() as { login: string; senha: string; nick: string | null }[];

  return rows
    .map((r) => {
      const nickPart = r.nick ? ` ${r.nick}` : '';
      return `${r.login}:${r.senha}${nickPart}`;
    })
    .join('\n');
}
export function addAccountsBulk(dados: Omit<Account, 'id'>[]): void {
  const stmt = db.prepare(`
    INSERT INTO accounts (login, senha, nick, elo, observacoes, deletedAt, pastaId)
    VALUES (@login, @senha, @nick, @elo, @observacoes, @deletedAt, @pastaId)
  `);
  const inserirTodos = db.transaction((contas: Omit<Account, 'id'>[]) => {
    contas.forEach((data) => {
      const existe = db
        .prepare('SELECT id, deletedAt FROM accounts WHERE login = ?')
        .get(data.login) as { id: number; deletedAt: string | null } | undefined;
      if (existe) {
        if (existe.deletedAt !== null) {
          db.prepare('UPDATE accounts SET deletedAt = NULL WHERE id = ?').run(existe.id);
        }
        if (data.nick) {
          db.prepare('UPDATE accounts SET nick = ? WHERE id = ?').run(data.nick, existe.id);
        }
        return;
      }
      stmt.run({
        login: data.login,
        senha: data.senha,
        nick: data.nick ?? null,
        elo: data.elo ?? null,
        observacoes: data.observacoes ?? null,
        deletedAt: data.deletedAt ?? null,
        pastaId: data.pastaId ?? null,
      });
    });
  });
  inserirTodos(dados);
}

export function emptyTrash(): void {
  db.prepare('DELETE FROM accounts WHERE deletedAt IS NOT NULL').run();
}

export function reorderAccounts(ids: number[]): void {
  const stmt = db.prepare('UPDATE accounts SET ordem = @ordem WHERE id = @id');
  const atualizar = db.transaction((lista: number[]) => {
    lista.forEach((id, index) => {
      stmt.run({ ordem: index, id });
    });
  });
  atualizar(ids);
}

export function salvarHistoricoBackup(): void {
  const rows = db.prepare('SELECT login, senha, nick FROM accounts').all() as {
    login: string;
    senha: string;
    nick: string | null;
  }[];

  if (rows.length === 0) return;

  const conteudo = rows
    .map((r) => {
      const nickPart = r.nick ? ` ${r.nick}` : '';
      return `${r.login}:${r.senha}${nickPart}`;
    })
    .join('\n');

  db.prepare('INSERT INTO backup_historico (conteudo, criadoEm) VALUES (@conteudo, @criadoEm)').run(
    { conteudo, criadoEm: new Date().toISOString() }
  );

  // Mantém só os últimos 3 registros
  db.exec(`
    DELETE FROM backup_historico
    WHERE id NOT IN (
      SELECT id FROM backup_historico ORDER BY id DESC LIMIT 3
    )
  `);
}

export function listarHistoricoBackup(): { id: number; criadoEm: string; conteudo: string }[] {
  return db.prepare('SELECT * FROM backup_historico ORDER BY id DESC').all() as {
    id: number;
    criadoEm: string;
    conteudo: string;
  }[];
}
