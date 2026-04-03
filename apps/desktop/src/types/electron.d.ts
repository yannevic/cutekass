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
      deletePasta: (id: number) => Promise<void>;
      exportAccounts: (ids: number[]) => Promise<string>;
      getRiotKey: () => Promise<string>;
      saveRiotKey: (key: string) => Promise<void>;
      fetchElo: (nick: string) => Promise<{ elo: string; wins: number; losses: number }>;
      loginRiot: (login: string, senha: string) => Promise<void>;
      getRiotClientPath: () => Promise<string>;
      saveRiotClientPath: (path: string) => Promise<void>;
      bulkAddAccounts: (dados: Omit<Account, 'id'>[]) => Promise<void>;
      emptyTrash: () => Promise<void>;
      checkForUpdates: () => Promise<void>;
      installUpdate: () => Promise<void>;
      getAppVersion: () => Promise<string>;
      onUpdateAvailable: (cb: () => void) => void;
      onUpdateNotAvailable: (cb: () => void) => void;
      onUpdateDownloaded: (cb: () => void) => void;
      onUpdateError: (cb: (msg: string) => void) => void;
      reorderAccounts: (ids: number[]) => Promise<void>;
      listarHistoricoBackup: () => Promise<{ id: number; criadoEm: string; conteudo: string }[]>;
      openExternal: (url: string) => Promise<void>;
      addPasta: (nome: string, cor: string, icone: string) => Promise<Pasta>;
      updatePasta: (id: number, nome: string, cor: string, icone: string) => Promise<void>;
      reorderPastas: (ids: number[]) => Promise<void>;
      fetchLcuData: () => Promise<{
        nivel: number;
        essenciaAzul: number;
        essenciaLaranja: number;
        numCampeoes: number;
        numSkins: number;
        skinsNomes: string[];
        nick: string;
      }>;
    };
  }
}

export {};
