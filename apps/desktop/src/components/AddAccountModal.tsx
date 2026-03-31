import { useState } from 'react';
import type { Account } from '../types/account';

interface Props {
  contaParaEditar?: Account;
  onAdd: (data: Omit<Account, 'id'>) => Promise<void>;
  onEdit: (data: Account) => Promise<void>;
  onClose: () => void;
}

export default function AddAccountModal({ contaParaEditar, onAdd, onEdit, onClose }: Props) {
  const editando = contaParaEditar !== undefined;

  const [login, setLogin] = useState(contaParaEditar?.login ?? '');
  const [senha, setSenha] = useState(contaParaEditar?.senha ?? '');
  const [nick, setNick] = useState(contaParaEditar?.nick ?? '');
  const [elo, setElo] = useState(contaParaEditar?.elo ?? '');
  const [observacoes, setObservacoes] = useState(contaParaEditar?.observacoes ?? '');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit() {
    if (!login.trim() || !senha.trim() || !nick.trim()) return;

    setSalvando(true);

    if (editando) {
      await onEdit({
        ...contaParaEditar,
        login,
        senha,
        nick,
        elo: elo.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });
    } else {
      await onAdd({
        login,
        senha,
        nick,
        elo: elo.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
        deletedAt: undefined,
      });
    }

    setSalvando(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4">
        <h2 className="text-lg font-bold text-yellow-400">
          {editando ? 'Editar conta' : 'Adicionar conta'}
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Login</label>
          <input
            className="bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="seu@email.com"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Senha</label>
          <div className="flex gap-2">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              className="flex-1 bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="px-3 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm text-zinc-300"
            >
              {mostrarSenha ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Nick</label>
          <input
            className="bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder="NomeDaContaNoLoL"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Elo (opcional)</label>
          <input
            className="bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
            value={elo}
            onChange={(e) => setElo(e.target.value)}
            placeholder="ex: Ouro II, Platina IV..."
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">Observações (opcional)</label>
          <textarea
            className="bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            placeholder="ex: conta smurfada, ban temporário..."
          />
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={salvando || !login.trim() || !senha.trim() || !nick.trim()}
            className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
