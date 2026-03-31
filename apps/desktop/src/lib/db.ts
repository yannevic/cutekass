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

// ─── Accounts ─────────────────────────────────────────────────────────────────

export function listAccounts(): Account[] {
  return db.prepare('SELECT * FROM accounts WHERE deletedAt IS NULL').all() as Account[];
}

export function listTrash(): Account[] {
  return db.prepare('SELECT * FROM accounts WHERE deletedAt IS NOT NULL').all() as Account[];
}

export function addAccount(data: Omit<Account, 'id'>): Account {
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

export function updateAccount(data: Account): void {
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
  return db.prepare('SELECT * FROM pastas ORDER BY id ASC').all() as Pasta[];
}

export function addPasta(nome: string, cor: string): Pasta {
  const result = db
    .prepare('INSERT INTO pastas (nome, cor) VALUES (@nome, @cor)')
    .run({ nome, cor });
  return { id: result.lastInsertRowid as number, nome, cor };
}

export function updatePasta(id: number, nome: string, cor: string): void {
  db.prepare('UPDATE pastas SET nome = @nome, cor = @cor WHERE id = @id').run({ id, nome, cor });
}

export function deletePasta(id: number): void {
  db.prepare('UPDATE accounts SET pastaId = NULL WHERE pastaId = @id').run({ id });
  db.prepare('DELETE FROM pastas WHERE id = @id').run({ id });
}
