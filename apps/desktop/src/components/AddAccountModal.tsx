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
  const [buscandoElo, setBuscandoElo] = useState(false);
  const [erroElo, setErroElo] = useState('');
  const [erroSalvar, setErroSalvar] = useState('');

  const sugestoes = useMemo(() => {
    const termo = eloInput.trim().toLowerCase();
    if (!termo) return TODAS_OPCOES;
    return TODAS_OPCOES.filter((op) => op.toLowerCase().includes(termo));
  }, [eloInput]);

  function selecionarElo(opcao: string) {
    setEloInput(opcao);
    setAutocompleteAberto(false);
  }

  async function handleBuscarElo() {
    const nickTrimado = nick.trim();
    if (!nickTrimado.includes('#')) {
      setErroElo('Nick deve estar no formato Nome#TAG (ex: Faker#BR1)');
      return;
    }
    setErroElo('');
    setBuscandoElo(true);
    try {
      const resultado = await window.electronAPI.fetchElo(nickTrimado);
      setEloInput(resultado.elo);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao buscar elo';
      setErroElo(msg);
    }
    setBuscandoElo(false);
  }

  async function handleSubmit() {
    if (!login.trim() || !senha.trim()) return;

    const nickTrimado = nick.trim();
    if (nickTrimado) {
      const posHash = nickTrimado.indexOf('#');
      if (posHash <= 0 || posHash === nickTrimado.length - 1) {
        setErroSalvar('Nick deve estar no formato Nome#TAG');
        return;
      }
    }

    setSalvando(true);
    setErroSalvar('');
    const eloFinal = eloInput.trim() || undefined;
    try {
      if (editando) {
        await onEdit({
          ...contaParaEditar,
          login,
          senha,
          nick: nickTrimado || undefined,
          elo: eloFinal,
          observacoes: observacoes.trim() || undefined,
        });
      } else {
        await onAdd({
          login,
          senha,
          nick: nickTrimado || undefined,
          elo: eloFinal,
          observacoes: observacoes.trim() || undefined,
          deletedAt: undefined,
        });
      }
      onClose();
    } catch (e) {
      const raw =
        e instanceof Error
          ? e.message
          : typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message: unknown }).message)
            : String(e);
      const msg = raw.replace(/^Error invoking remote method '[^']+': Error: /, '');
      setErroSalvar(msg);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-void-900 border border-void-800 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-xl shadow-black/50">
        <h2 className="text-lg font-bold text-rift-300">
          {editando ? 'Editar conta' : 'Adicionar conta'}
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-rift-200/60">
            Login <span className="text-red-400">*</span>
          </label>
          <input
            className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 placeholder-rift-200/20 transition-colors"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="usuário"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-rift-200/60">
            Senha <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              className="flex-1 bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 placeholder-rift-200/20 transition-colors"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="px-3 py-2 rounded-lg bg-void-800 hover:bg-void-700 text-sm text-rift-200/70 transition-colors"
            >
              {mostrarSenha ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-rift-200/60">Nick (opcional)</label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 placeholder-rift-200/20 transition-colors"
              value={nick}
              onChange={(e) => {
                setNick(e.target.value);
                setErroElo('');
              }}
              placeholder="Nome#TAG"
            />
            <button
              type="button"
              onClick={handleBuscarElo}
              disabled={buscandoElo || !nick.trim()}
              className="px-3 py-2 rounded-lg bg-void-800 hover:bg-void-700 text-sm text-rift-200/70 disabled:opacity-40 transition-colors whitespace-nowrap"
              title="Buscar elo via API da Riot"
            >
              {buscandoElo ? '...' : '🔍 Buscar elo'}
            </button>
          </div>
          {erroElo && <p className="text-xs text-red-400">{erroElo}</p>}
        </div>

        <div className="flex flex-col gap-1 relative">
          <label className="text-sm text-rift-200/60">Elo (opcional)</label>
          <input
            className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 placeholder-rift-200/20 transition-colors"
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
            <ul className="absolute top-full left-0 right-0 mt-1 bg-void-900 border border-void-800 rounded-lg overflow-y-auto max-h-44 z-10 shadow-lg shadow-black/50">
              {sugestoes.map((opcao) => (
                <li key={opcao}>
                  <button
                    type="button"
                    onMouseDown={() => selecionarElo(opcao)}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-void-800 transition-colors"
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
          <label className="text-sm text-rift-200/60">Observações (opcional)</label>
          <textarea
            className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 placeholder-rift-200/20 resize-none transition-colors"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            placeholder="ex: conta smurfada, ban temporário..."
          />
        </div>

        {erroSalvar ? <p className="text-red-400 text-xs text-center -mt-1">{erroSalvar}</p> : null}

        <div className="flex gap-3 justify-end mt-2"></div>

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-void-800 hover:bg-void-700 text-sm text-rift-200/70 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={salvando || !login.trim() || !senha.trim()}
            className="px-4 py-2 rounded-lg bg-rift-500 hover:bg-rift-400 text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
