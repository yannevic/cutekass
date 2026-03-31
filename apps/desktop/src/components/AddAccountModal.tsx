import { useState, useMemo } from 'react';
import type { Account } from '../types/account';
import { gerarOpcoesElo, corDoElo, UNRANKED } from '../lib/eloConfig';

interface Props {
  contaParaEditar?: Account;
  onAdd: (data: Omit<Account, 'id'>) => Promise<void>;
  onEdit: (data: Account) => Promise<void>;
  onClose: () => void;
}

const TODAS_OPCOES = gerarOpcoesElo();

export default function AddAccountModal({ contaParaEditar, onAdd, onEdit, onClose }: Props) {
  const editando = contaParaEditar !== undefined;

  const [login, setLogin] = useState(contaParaEditar?.login ?? '');
  const [senha, setSenha] = useState(contaParaEditar?.senha ?? '');
  const [nick, setNick] = useState(contaParaEditar?.nick ?? '');
  const [eloInput, setEloInput] = useState(contaParaEditar?.elo ?? '');
  const [observacoes, setObservacoes] = useState(contaParaEditar?.observacoes ?? '');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [autocompleteAberto, setAutocompleteAberto] = useState(false);

  const sugestoes = useMemo(() => {
    const termo = eloInput.trim().toLowerCase();
    if (!termo) return TODAS_OPCOES;
    return TODAS_OPCOES.filter((op) => op.toLowerCase().includes(termo));
  }, [eloInput]);

  function selecionarElo(opcao: string) {
    setEloInput(opcao);
    setAutocompleteAberto(false);
  }

  async function handleSubmit() {
    if (!login.trim() || !senha.trim()) return;

    setSalvando(true);

    const eloFinal = eloInput.trim() || undefined;

    if (editando) {
      await onEdit({
        ...contaParaEditar,
        login,
        senha,
        nick: nick.trim() || undefined,
        elo: eloFinal,
        observacoes: observacoes.trim() || undefined,
      });
    } else {
      await onAdd({
        login,
        senha,
        nick: nick.trim() || undefined,
        elo: eloFinal,
        observacoes: observacoes.trim() || undefined,
        deletedAt: undefined,
      });
    }

    setSalvando(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-800 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-yellow-400">
          {editando ? 'Editar conta' : 'Adicionar conta'}
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">
            Login <span className="text-red-400">*</span>
          </label>
          <input
            className="bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="usuário"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">
            Senha <span className="text-red-400">*</span>
          </label>
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
          <label className="text-sm text-zinc-400">Nick (opcional)</label>
          <input
            className="bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder="NomeDaContaNoLoL"
          />
        </div>

        <div className="flex flex-col gap-1 relative">
          <label className="text-sm text-zinc-400">Elo (opcional)</label>
          <input
            className="bg-zinc-700 rounded-lg px-3 py-2 text-white outline-none focus:ring-2 focus:ring-yellow-400"
            value={eloInput}
            onChange={(e) => {
              setEloInput(e.target.value);
              setAutocompleteAberto(true);
            }}
            onFocus={() => setAutocompleteAberto(true)}
            onBlur={() => setTimeout(() => setAutocompleteAberto(false), 150)}
            placeholder="ex: Ouro II, Platina IV..."
            style={eloInput ? { color: corDoElo(eloInput) } : undefined}
          />
          {autocompleteAberto && sugestoes.length > 0 ? (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-zinc-700 rounded-lg overflow-y-auto max-h-44 z-10 shadow-lg">
              {sugestoes.map((opcao) => (
                <li key={opcao}>
                  <button
                    type="button"
                    onMouseDown={() => selecionarElo(opcao)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-600 transition-colors"
                    style={{ color: opcao === UNRANKED.nome ? '#6b7280' : corDoElo(opcao) }}
                  >
                    {opcao}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
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
            disabled={salvando || !login.trim() || !senha.trim()}
            className="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
