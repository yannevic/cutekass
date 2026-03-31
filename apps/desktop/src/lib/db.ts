import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import type { Account } from '../types/account';

const dbPath = path.join(app.getPath('userData'), 'accounts.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    login      TEXT NOT NULL,
    senha      TEXT NOT NULL,
    nick       TEXT NOT NULL,
    elo        TEXT,
    observacoes TEXT,
    deletedAt  TEXT
  )
`);

export function listAccounts(): Account[] {
  return db.prepare('SELECT * FROM accounts WHERE deletedAt IS NULL').all() as Account[];
}

export function listTrash(): Account[] {
  return db.prepare('SELECT * FROM accounts WHERE deletedAt IS NOT NULL').all() as Account[];
}

export function addAccount(data: Omit<Account, 'id'>): Account {
  const stmt = db.prepare(`
    INSERT INTO accounts (login, senha, nick, elo, observacoes, deletedAt)
    VALUES (@login, @senha, @nick, @elo, @observacoes, @deletedAt)
  `);
  const result = stmt.run(data);
  return { id: result.lastInsertRowid as number, ...data };
}

export function updateAccount(id: number, data: Partial<Omit<Account, 'id'>>): void {
  const fields = Object.keys(data)
    .map((k) => `${k} = @${k}`)
    .join(', ');
  db.prepare(`UPDATE accounts SET ${fields} WHERE id = @id`).run({ ...data, id });
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
