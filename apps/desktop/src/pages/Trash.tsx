import { useState, useEffect, useCallback } from 'react';
import type { Account } from '../types/account';
import ConfirmDialog from '../components/ConfirmDialog';
import Sidebar from '../components/Sidebar';
import usePastas from '../hooks/usePastas';

export default function Trash() {
  const [contas, setContas] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  const { pastas, updatePasta, deletePasta } = usePastas();

  const fetchTrash = useCallback(async () => {
    setLoading(true);
    const data = await window.electronAPI.getTrash();
    setContas(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  async function restaurar(id: number) {
    await window.electronAPI.restoreAccount(id);
    await fetchTrash();
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return;
    await window.electronAPI.permanentDelete(idParaExcluir);
    setIdParaExcluir(null);
    await fetchTrash();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <p className="text-zinc-400">Carregando lixeira...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-white overflow-hidden">
      <Sidebar
        pastas={pastas}
        pastaAtiva={null}
        onSelecionarPasta={() => {}}
        onNovaPasta={() => {}}
        onRenamePasta={(id, nome, cor) => updatePasta(id, nome, cor)}
        onDeletePasta={(id) => deletePasta(id)}
      />

      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-zinc-400 mb-6">Lixeira</h1>

        {contas.length === 0 ? (
          <p className="text-zinc-500 text-center mt-20">A lixeira está vazia.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {contas.map((conta) => (
              <li
                key={conta.id}
                className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-zinc-300">{conta.nick}</p>
                  <p className="text-sm text-zinc-500">{conta.login}</p>
                  {conta.observacoes ? (
                    <p className="text-xs text-zinc-600 mt-1">{conta.observacoes}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => restaurar(conta.id)}
                    className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded-lg"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdParaExcluir(conta.id)}
                    className="text-xs bg-red-800 hover:bg-red-700 px-3 py-1 rounded-lg"
                  >
                    Excluir permanente
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {idParaExcluir !== null ? (
        <ConfirmDialog
          mensagem="Excluir permanentemente? Essa ação não pode ser desfeita."
          onConfirmar={confirmarExclusao}
          onCancelar={() => setIdParaExcluir(null)}
        />
      ) : null}
    </div>
  );
}
