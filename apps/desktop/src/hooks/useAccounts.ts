import { useState, useEffect, useCallback } from 'react';
import type { Account } from '../types/account';

export default function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const updateAccountSilent = useCallback(async (data: Account) => {
    await window.electronAPI.updateAccount(data);
  }, []);
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    const data = await window.electronAPI.getAccounts();
    setAccounts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = useCallback(
    async (data: Omit<Account, 'id'>) => {
      await window.electronAPI.addAccount(data);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const updateAccount = useCallback(
    async (data: Account) => {
      await window.electronAPI.updateAccount(data);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const deleteAccount = useCallback(
    async (id: number) => {
      await window.electronAPI.deleteAccount(id);
      await fetchAccounts();
    },
    [fetchAccounts]
  );
  const bulkAddAccounts = useCallback(
    async (dados: Omit<Account, 'id'>[]) => {
      await window.electronAPI.bulkAddAccounts(dados);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const bulkDelete = useCallback(
    async (ids: number[]) => {
      await window.electronAPI.bulkDelete(ids);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const bulkSetElo = useCallback(
    async (ids: number[], elo: string) => {
      await window.electronAPI.bulkSetElo(ids, elo);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const bulkMovePasta = useCallback(
    async (ids: number[], pastaId: number | null) => {
      await window.electronAPI.bulkMovePasta(ids, pastaId);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  const copyToClipboard = useCallback(async (text: string) => {
    await window.electronAPI.copyToClipboard(text);
  }, []);

  const reorderAccounts = useCallback(
    async (ids: number[]) => {
      await window.electronAPI.reorderAccounts(ids);
      await fetchAccounts();
    },
    [fetchAccounts]
  );

  return {
    accounts,
    loading,
    fetchAccounts,
    addAccount,
    updateAccount,
    updateAccountSilent,
    deleteAccount,
    bulkDelete,
    bulkSetElo,
    bulkMovePasta,
    copyToClipboard,
    bulkAddAccounts,
    reorderAccounts,
  };
}
