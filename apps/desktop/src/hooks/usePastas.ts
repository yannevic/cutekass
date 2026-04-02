import { useState, useEffect, useCallback } from 'react';
import type { Pasta } from '../types/pasta';

export default function usePastas() {
  const [pastas, setPastas] = useState<Pasta[]>([]);

  const fetchPastas = useCallback(async () => {
    const data = await window.electronAPI.getPastas();
    setPastas(data);
  }, []);

  useEffect(() => {
    fetchPastas();
  }, [fetchPastas]);

  const addPasta = useCallback(
    async (nome: string, cor: string, icone: string) => {
      await window.electronAPI.addPasta(nome, cor, icone);
      await fetchPastas();
    },
    [fetchPastas]
  );

  const updatePasta = useCallback(
    async (id: number, nome: string, cor: string, icone: string) => {
      await window.electronAPI.updatePasta(id, nome, cor, icone);
      await fetchPastas();
    },
    [fetchPastas]
  );

  const deletePasta = useCallback(
    async (id: number) => {
      await window.electronAPI.deletePasta(id);
      await fetchPastas();
    },
    [fetchPastas]
  );

  const reorderPastas = useCallback(
    async (ids: number[]) => {
      await window.electronAPI.reorderPastas(ids);
      await fetchPastas();
    },
    [fetchPastas]
  );

  return { pastas, addPasta, updatePasta, deletePasta, reorderPastas };
}
