import { useState, useEffect, useCallback } from 'react';
import type { Account } from '../types/account';
import ConfirmDialog from '../components/ConfirmDialog';
import Sidebar from '../components/Sidebar';
import usePastas from '../hooks/usePastas';
import SettingsModal from '../components/SettingsModal';

export default function Trash() {
  const [contas, setContas] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  const { pastas, updatePasta, deletePasta } = usePastas();
  const [configuracoesAberto, setConfiguracoesAberto] = useState(false);

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
      <div className="min-h-screen bg-void-950 text-rift-200 flex items-center justify-center">
        <p className="text-rift-200/50">Carregando lixeira...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-void-950 text-rift-200 overflow-hidden">
      <Sidebar
        pastas={pastas}
        pastaAtiva={null}
        onSelecionarPasta={() => {}}
        onNovaPasta={() => {}}
        onRenamePasta={(id, nome, cor) => updatePasta(id, nome, cor)}
        onDeletePasta={(id) => deletePasta(id)}
        onConfiguracoes={() => setConfiguracoesAberto(true)}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold text-rift-300 mb-6">🗑️ Lixeira</h1>

        {contas.length === 0 ? (
          <p className="text-rift-200/40 text-center mt-20">A lixeira está vazia.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {contas.map((conta) => (
              <li
                key={conta.id}
                className="bg-void-900 border border-void-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-rift-200/70">{conta.nick}</p>
                  <p className="text-sm text-rift-200/40">{conta.login}</p>
                  {conta.observacoes ? (
                    <p className="text-xs text-rift-200/30 mt-1">{conta.observacoes}</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => restaurar(conta.id)}
                    className="text-xs bg-void-800 hover:bg-void-700 text-rift-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdParaExcluir(conta.id)}
                    className="text-xs bg-red-900/50 hover:bg-red-800/70 text-red-400 border border-red-800/50 px-3 py-1.5 rounded-lg transition-colors"
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
      {configuracoesAberto ? <SettingsModal onClose={() => setConfiguracoesAberto(false)} /> : null}
    </div>
  );
}
