import type { Account } from './account';
import type { Pasta } from './pasta';

declare global {
  interface Window {
    electronAPI: {
      getAccounts: () => Promise<Account[]>;
      addAccount: (account: Omit<Account, 'id'>) => Promise<Account>;
      updateAccount: (account: Account) => Promise<void>;
      deleteAccount: (id: number) => Promise<void>;
      restoreAccount: (id: number) => Promise<void>;
      permanentDelete: (id: number) => Promise<void>;
      getTrash: () => Promise<Account[]>;
      copyToClipboard: (text: string) => Promise<void>;
      bulkDelete: (ids: number[]) => Promise<void>;
      bulkSetElo: (ids: number[], elo: string) => Promise<void>;
      bulkMovePasta: (ids: number[], pastaId: number | null) => Promise<void>;
      getPastas: () => Promise<Pasta[]>;
      addPasta: (nome: string, cor: string) => Promise<Pasta>;
      updatePasta: (id: number, nome: string, cor: string) => Promise<void>;
      deletePasta: (id: number) => Promise<void>;
    };
  }
}

export {};
