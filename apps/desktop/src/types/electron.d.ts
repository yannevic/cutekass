import type { Account } from './account';

declare global {
  interface Window {
    electronAPI: {
      getAccounts: () => Promise<Account[]>;
      addAccount: (account: Omit<Account, 'id'>) => Promise<Account>;
      deleteAccount: (id: number) => Promise<void>;
      restoreAccount: (id: number) => Promise<void>;
      permanentDelete: (id: number) => Promise<void>;
      getTrash: () => Promise<Account[]>;
      copyToClipboard: (text: string) => Promise<void>;
      updateAccount: (account: Account) => Promise<void>;
    };
  }
}

export {};
