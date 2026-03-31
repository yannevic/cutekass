import { useState } from 'react';
import useAccounts from '../hooks/useAccounts';
import AddAccountModal from '../components/AddAccountModal';
import ConfirmDialog from '../components/ConfirmDialog';
import type { Account } from '../types/account';

export default function Home() {
  const { accounts, loading, addAccount, updateAccount, deleteAccount, copyToClipboard } =
    useAccounts();
  const [modalAberto, setModalAberto] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<Account | undefined>(undefined);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  const [senhasVisiveis, setSenhasVisiveis] = useState<Set<number>>(new Set());

  function toggleSenha(id: number) {
    setSenhasVisiveis((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function abrirEdicao(conta: Account) {
    setContaParaEditar(conta);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setContaParaEditar(undefined);
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return;
    await deleteAccount(idParaExcluir);
    setIdParaExcluir(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <p className="text-zinc-400">Carregando contas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-yellow-400">LoL Accounts ✦</h1>
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-lg"
        >
          + Adicionar
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-zinc-400 text-center mt-20">Nenhuma conta cadastrada ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {accounts.map((account) => {
            const senhaVisivel = senhasVisiveis.has(account.id);
            return (
              <li
                key={account.id}
                className="bg-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="font-semibold">{account.nick}</p>
                  <p className="text-sm text-zinc-400">{account.login}</p>
                  <p className="text-sm text-zinc-500 font-mono">
                    {senhaVisivel ? account.senha : '••••••••'}
                  </p>
                  {account.elo ? (
                    <p className="text-xs text-yellow-500 mt-0.5">{account.elo}</p>
                  ) : null}
                  {account.observacoes ? (
                    <p className="text-xs text-zinc-500">{account.observacoes}</p>
                  ) : null}
                </div>

                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  <button
                    type="button"
                    onClick={() => toggleSenha(account.id)}
                    className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded-lg"
                  >
                    {senhaVisivel ? 'Ocultar' : 'Ver senha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.login)}
                    className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded-lg"
                  >
                    Copiar login
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(account.senha)}
                    className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded-lg"
                  >
                    Copiar senha
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirEdicao(account)}
                    className="text-xs bg-zinc-600 hover:bg-zinc-500 px-3 py-1 rounded-lg"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdParaExcluir(account.id)}
                    className="text-xs bg-red-800 hover:bg-red-700 px-3 py-1 rounded-lg"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalAberto ? (
        <AddAccountModal
          contaParaEditar={contaParaEditar}
          onAdd={addAccount}
          onEdit={updateAccount}
          onClose={fecharModal}
        />
      ) : null}

      {idParaExcluir !== null ? (
        <ConfirmDialog
          mensagem="Mover essa conta para a lixeira?"
          onConfirmar={confirmarExclusao}
          onCancelar={() => setIdParaExcluir(null)}
        />
      ) : null}
    </div>
  );
}
