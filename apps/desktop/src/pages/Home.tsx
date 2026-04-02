import { useState, useMemo, useEffect } from 'react';
import LcuModal from '../components/LcuModal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImportModal from '../components/ImportModal';
import { ParsedAccount } from '../lib/parser';
import useAccounts from '../hooks/useAccounts';
import usePastas from '../hooks/usePastas';
import AddAccountModal from '../components/AddAccountModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EloBadge from '../components/EloBadge';
import Sidebar from '../components/Sidebar';
import CreatePastaModal from '../components/CreatePastaModal';
import BulkActionBar from '../components/BulkActionBar';
import { ELO_TIERS, UNRANKED } from '../lib/eloConfig';
import type { Account } from '../types/account';
import SettingsModal from '../components/SettingsModal';
import type { UpdateStatus } from '../components/UpdateNotifier';
import Select from '../components/Select';
import { corDoElo } from '../lib/eloConfig';

const OPCOES_FILTRO = ['Todos', UNRANKED.nome, ...ELO_TIERS.map((t) => t.nome)];

// ─── Card arrastável ──────────────────────────────────────────────────────────

interface HomeProps {
  updateStatus: UpdateStatus;
  updateErro: string;
  onUpdateStatus: (status: UpdateStatus) => void;
  onUpdateErro: (msg: string) => void;
  sidebarAberta: boolean;
  onSidebarHover: (hover: boolean) => void;
}

interface CardProps {
  account: Account;
  senhaVisivel: boolean;
  estaSelecionado: boolean;
  dropdownAberto: boolean;
  onToggleSenha: () => void;
  onToggleSelecionado: () => void;
  onLoginRiot: () => void;
  onCopiarLogin: () => void;
  onCopiarSenha: () => void;
  onAbrirDropdown: () => void;
  onFecharDropdown: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}

function AccountCard({
  account,
  senhaVisivel,
  estaSelecionado,
  dropdownAberto,
  onToggleSenha,
  onToggleSelecionado,
  onLoginRiot,
  onCopiarLogin,
  onCopiarSenha,
  onAbrirDropdown,
  onFecharDropdown,
  onEditar,
  onExcluir,
}: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: account.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group/card bg-void-900 border rounded-xl p-4 flex items-center gap-4 transition-all ${
        estaSelecionado
          ? 'ring-2 ring-rift-300 border-rift-300/30'
          : 'border-void-800 hover:border-void-700'
      }`}
    >
      {/* Handle de arrastar */}
      <button
        type="button"
        className="text-rift-200/20 hover:text-rift-200/60 cursor-grab active:cursor-grabbing shrink-0 touch-none px-2 -mx-2 self-stretch flex items-center rounded-lg hover:bg-void-800 transition-colors"
        {...attributes}
        {...listeners}
        title="Arrastar para reordenar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="19" r="1.5" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onToggleSelecionado}
        className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-all cursor-pointer ${
          estaSelecionado
            ? 'bg-rift-300 border-rift-300'
            : 'bg-transparent border-rift-200/30 hover:border-rift-200/60 opacity-0 group-hover/card:opacity-100'
        }`}
      >
        {estaSelecionado && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-2.5 h-2.5 text-void-950"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-rift-200">{account.nick ?? account.login}</p>
          {account.elo ? <EloBadge elo={account.elo} /> : null}
        </div>
        <p className="text-sm text-rift-200/60">{account.login}</p>
        <p className="text-sm text-rift-200/40 font-mono">
          {senhaVisivel ? account.senha : '••••••••'}
        </p>
        {account.observacoes ? (
          <p className="text-xs text-rift-200/40">{account.observacoes}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleSenha}
          className="text-rift-200/40 hover:text-rift-200 p-1.5 rounded-lg hover:bg-void-800 transition-colors"
          title={senhaVisivel ? 'Ocultar senha' : 'Ver senha'}
        >
          {senhaVisivel ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={onLoginRiot}
          className="text-xs bg-rift-500 hover:bg-rift-400 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          ▶ Logar
        </button>

        <button
          type="button"
          onClick={onCopiarLogin}
          className="text-xs bg-void-800 hover:bg-void-700 text-rift-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Copiar login
        </button>

        <button
          type="button"
          onClick={onCopiarSenha}
          className="text-xs bg-void-800 hover:bg-void-700 text-rift-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Copiar senha
        </button>

        <div className="relative" data-dropdown>
          <button
            type="button"
            onClick={dropdownAberto ? onFecharDropdown : onAbrirDropdown}
            className="text-rift-200/40 hover:text-rift-200 p-1.5 rounded-lg hover:bg-void-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>

          {dropdownAberto && (
            <div className="absolute right-0 top-8 z-50 bg-void-900 border border-void-800 rounded-xl shadow-lg shadow-black/50 py-1 min-w-30">
              <button
                type="button"
                onClick={onEditar}
                className="w-full text-left text-sm px-4 py-2 text-rift-200 hover:bg-void-800 transition-colors"
              >
                ✏️ Editar
              </button>
              <button
                type="button"
                onClick={onExcluir}
                className="w-full text-left text-sm px-4 py-2 text-red-400 hover:bg-void-800 transition-colors"
              >
                🗑️ Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

export default function Home({
  updateStatus,
  updateErro,
  onUpdateStatus,
  onUpdateErro,
  sidebarAberta,
  onSidebarHover,
}: HomeProps) {
  const {
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
  } = useAccounts();
  const { pastas, addPasta, updatePasta, deletePasta, reorderPastas } = usePastas();

  const [modalAberto, setModalAberto] = useState(false);
  const [importModalAberto, setImportModalAberto] = useState(false);
  const [criarPastaAberto, setCriarPastaAberto] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<Account | undefined>(undefined);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  const [confirmarExclusaoLote, setConfirmarExclusaoLote] = useState(false);
  const [senhasVisiveis, setSenhasVisiveis] = useState<Set<number>>(new Set());
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [busca, setBusca] = useState('');
  const [filtroElo, setFiltroElo] = useState('Todos');
  const [pastaAtiva, setPastaAtiva] = useState<number | null>(null);
  const [filtraSemPasta, setFiltraSemPasta] = useState(false);
  const [filtraSemNick, setFiltraSemNick] = useState(false);
  const [dropdownAberto, setDropdownAberto] = useState<number | null>(null);
  const [lcuModal, setLcuModal] = useState<{
    nick: string;
    dados: {
      nivel: number;
      essenciaAzul: number;
      essenciaLaranja: number;
      numCampeoes: number;
      numSkins: number;
      nick: string;
    } | null;
    erro: string;
    carregando: boolean;
  } | null>(null);
  const [ordem, setOrdem] = useState<'recentes' | 'antigas' | 'alfabetica' | 'z-a' | 'custom'>(
    () => {
      const salvo = localStorage.getItem('cutekass-ordem');
      if (
        salvo === 'custom' ||
        salvo === 'recentes' ||
        salvo === 'antigas' ||
        salvo === 'alfabetica' ||
        salvo === 'z-a'
      ) {
        return salvo;
      }
      return 'recentes';
    }
  );
  const [configuracoesAberto, setConfiguracoesAberto] = useState(false);
  const [atualizandoElos, setAtualizandoElos] = useState(false);
  const [progressoElo, setProgressoElo] = useState<{ atual: number; total: number } | null>(null);
  const [erroAtualizacao, setErroAtualizacao] = useState('');
  const [erroLogin, setErroLogin] = useState<string>('');
  const [ordemCustom, setOrdemCustom] = useState<number[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      const alvo = e.target as HTMLElement;
      if (!alvo.closest('[data-dropdown]')) {
        setDropdownAberto(null);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  useEffect(() => {
    setOrdemCustom(accounts.map((a) => a.id));
  }, [accounts]);

  const contasFiltradas = useMemo(() => {
    const base = accounts.filter((acc) => {
      const termoBusca = busca.trim().toLowerCase();
      const passaBusca =
        !termoBusca ||
        acc.nick?.toLowerCase().includes(termoBusca) ||
        acc.login.toLowerCase().includes(termoBusca);
      const passaNick = !filtraSemNick || !acc.nick; // ← dentro do filter

      function passaElo() {
        if (filtroElo === 'Todos') return true;
        if (filtroElo === UNRANKED.nome) return !acc.elo || acc.elo === UNRANKED.nome;
        return acc.elo?.startsWith(filtroElo) ?? false;
      }

      function passaPasta() {
        if (filtraSemPasta) return acc.pastaId === null || acc.pastaId === undefined;
        if (pastaAtiva === null) return true;
        return acc.pastaId === pastaAtiva;
      }

      return passaBusca && passaElo() && passaPasta() && passaNick;
    });

    if (ordem === 'custom') {
      return [...base].sort((a, b) => ordemCustom.indexOf(a.id) - ordemCustom.indexOf(b.id));
    }

    if (ordem === 'alfabetica') {
      return [...base].sort((a, b) => {
        const nomeA = (a.nick || a.login).toLowerCase();
        const nomeB = (b.nick || b.login).toLowerCase();
        if (nomeA < nomeB) return -1;
        if (nomeA > nomeB) return 1;
        return 0;
      });
    }

    if (ordem === 'z-a') {
      return [...base].sort((a, b) => {
        const nomeA = (a.nick || a.login).toLowerCase();
        const nomeB = (b.nick || b.login).toLowerCase();
        if (nomeA > nomeB) return -1;
        if (nomeA < nomeB) return 1;
        return 0;
      });
    }

    if (ordem === 'antigas') return [...base].sort((a, b) => a.id - b.id);
    return [...base].sort((a, b) => b.id - a.id);
  }, [accounts, busca, filtroElo, pastaAtiva, filtraSemPasta, filtraSemNick, ordem, ordemCustom]);

  useEffect(() => {
    localStorage.setItem('cutekass-ordem', ordem);
  }, [ordem]);

  const algumSelecionado = selecionados.size > 0;
  const todosSelecionados =
    contasFiltradas.length > 0 && selecionados.size === contasFiltradas.length;

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

  function toggleSelecionado(id: number) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelecionarTodos() {
    if (todosSelecionados) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(contasFiltradas.map((a) => a.id)));
    }
  }

  function abrirEdicao(conta: Account) {
    setContaParaEditar(conta);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setContaParaEditar(undefined);
  }

  function selecionarPasta(id: number | null) {
    setPastaAtiva(id);
    setFiltraSemPasta(false);
    setSelecionados(new Set());
  }

  async function handleVincularNick(conta: Account, nickLcu: string) {
    await updateAccount({ ...conta, nick: nickLcu });
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return;
    await deleteAccount(idParaExcluir);
    setIdParaExcluir(null);
  }

  async function handleExclusaoLote() {
    await bulkDelete(Array.from(selecionados));
    setSelecionados(new Set());
    setConfirmarExclusaoLote(false);
  }

  async function handleSetEloLote(elo: string) {
    await bulkSetElo(Array.from(selecionados), elo);
    setSelecionados(new Set());
  }

  async function handleMovePastaLote(pastaId: number | null) {
    await bulkMovePasta(Array.from(selecionados), pastaId);
    setSelecionados(new Set());
  }

  async function handleImport(parsed: ParsedAccount[]) {
    await bulkAddAccounts(
      parsed.map((p) => ({
        login: p.login,
        senha: p.senha,
        nick: p.nick ?? '',
        elo: '',
        observacoes: '',
        pastaId: pastaAtiva,
      }))
    );
    setImportModalAberto(false);
  }

  async function handleAtualizarElos(ids?: number[]) {
    const alvo = ids
      ? accounts.filter((a) => ids.includes(a.id) && a.nick && a.nick.includes('#'))
      : accounts.filter((a) => a.nick && a.nick.includes('#'));

    if (alvo.length === 0) {
      setErroAtualizacao(
        ids
          ? 'Nenhuma conta selecionada possui nick no formato Nome#TAG.'
          : 'Nenhuma conta possui nick no formato Nome#TAG.'
      );
      return;
    }

    const chave = await window.electronAPI.getRiotKey();
    if (!chave) {
      setErroAtualizacao('Chave da API da Riot não configurada. Acesse as Configurações.');
      return;
    }

    setErroAtualizacao('');
    setAtualizandoElos(true);
    setProgressoElo({ atual: 0, total: alvo.length });

    let erros = 0;
    for (let i = 0; i < alvo.length; i += 1) {
      const conta = alvo[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        const elo = await window.electronAPI.fetchElo(conta.nick!);
        // eslint-disable-next-line no-await-in-loop
        await updateAccountSilent({ ...conta, elo });
      } catch {
        erros += 1;
      }
      setProgressoElo({ atual: i + 1, total: alvo.length });
    }

    // Só busca uma vez no final — sem piscar
    await fetchAccounts(); // ← precisamos expor o fetchAccounts também

    setAtualizandoElos(false);
    setProgressoElo(null);

    if (erros > 0) {
      setErroAtualizacao(`${erros} conta${erros !== 1 ? 's' : ''} não puderam ser atualizadas.`);
    }
  }

  async function handleLoginRiot(login: string, senha: string) {
    setErroLogin('');
    try {
      await window.electronAPI.loginRiot(login, senha);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao tentar logar no Riot Client.';
      setErroLogin(msg);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = contasFiltradas.findIndex((a) => a.id === active.id);
    const newIndex = contasFiltradas.findIndex((a) => a.id === over.id);
    const novaOrdem = arrayMove(contasFiltradas, oldIndex, newIndex).map((a) => a.id);

    setOrdemCustom(novaOrdem);
    setOrdem('custom');
    await reorderAccounts(novaOrdem);
  }

  async function handleAvaliarGeral() {
    setLcuModal({ nick: 'Conta atual', dados: null, erro: '', carregando: true });
    try {
      const dados = await window.electronAPI.fetchLcuData();
      setLcuModal({ nick: 'Conta atual', dados, erro: '', carregando: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao ler o cliente do LoL.';
      setLcuModal({ nick: 'Conta atual', dados: null, erro: msg, carregando: false });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void-950 text-rift-200 flex items-center justify-center">
        <p className="text-rift-200/50">Carregando contas...</p>
      </div>
    );
  }

  const nomePastaAtiva = pastas.find((p) => p.id === pastaAtiva)?.nome ?? 'Pasta';

  return (
    <div className="flex h-screen bg-void-950 text-rift-200 overflow-hidden">
      <Sidebar
        pastas={pastas}
        pastaAtiva={pastaAtiva}
        onSelecionarPasta={selecionarPasta}
        onNovaPasta={() => setCriarPastaAberto(true)}
        onRenamePasta={(id, nome, cor, icone) => updatePasta(id, nome, cor, icone)}
        onReorderPastas={reorderPastas}
        onDeletePasta={(id) => deletePasta(id)}
        onConfiguracoes={() => setConfiguracoesAberto(true)}
        updateStatus={updateStatus}
        updateErro={updateErro}
        onUpdateStatus={onUpdateStatus}
        onUpdateErro={onUpdateErro}
        onHoverChange={onSidebarHover}
      />

      <main className={`flex-1 overflow-y-auto p-6 ${algumSelecionado ? 'pb-20' : ''}`}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {contasFiltradas.length > 0 && algumSelecionado && (
              <button
                type="button"
                onClick={toggleSelecionarTodos}
                className={`w-4 h-4 rounded shrink-0 border-2 flex items-center justify-center transition-all cursor-pointer ${
                  todosSelecionados
                    ? 'bg-rift-300 border-rift-300'
                    : 'bg-transparent border-rift-200/30 hover:border-rift-200/60'
                }`}
              >
                {todosSelecionados && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-2.5 h-2.5 text-void-950"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            )}
            <h2 className="text-xl font-bold text-rift-200">
              {filtraSemPasta
                ? 'Sem pasta'
                : pastaAtiva === null
                  ? 'Todas as contas'
                  : nomePastaAtiva}
            </h2>
          </div>
          <div className="flex gap-2 items-center">
            {progressoElo && (
              <div className="flex items-center gap-2 bg-void-900 border border-void-800 rounded-lg px-3 py-1.5">
                <span className="text-xs text-rift-200/50">Atualizando elos</span>
                <span className="text-sm font-bold text-rift-300">
                  {progressoElo.atual}
                  <span className="text-rift-200/30 font-normal">/{progressoElo.total}</span>
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleAvaliarGeral}
              className="bg-void-800 hover:bg-void-700 text-rift-200 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              🔍 Avaliar conta
            </button>
            <button
              type="button"
              onClick={() => handleAtualizarElos()}
              disabled={atualizandoElos}
              className="bg-void-800 hover:bg-void-700 disabled:opacity-50 text-rift-200 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {atualizandoElos ? '⟳ Atualizando...' : '⟳ Atualizar Elos'}
            </button>
            <button
              type="button"
              onClick={() => setImportModalAberto(true)}
              className="bg-void-800 hover:bg-void-700 text-rift-200 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              ↑ Importar
            </button>
            <button
              type="button"
              onClick={() => setModalAberto(true)}
              className="bg-rift-500 hover:bg-rift-400 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              + Adicionar
            </button>
          </div>
        </div>

        {/* Erros */}
        {erroAtualizacao && (
          <div className="mb-4 flex items-center justify-between bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-2 rounded-lg">
            <span>{erroAtualizacao}</span>
            <button
              type="button"
              onClick={() => setErroAtualizacao('')}
              className="ml-4 text-red-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        {erroLogin && (
          <div className="mb-4 flex items-center justify-between bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-2 rounded-lg">
            <span>{erroLogin}</span>
            <button
              type="button"
              onClick={() => setErroLogin('')}
              className="ml-4 text-red-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          <input
            className="flex-1 bg-void-900 border border-void-800 rounded-lg px-3 py-2 text-sm text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 placeholder-rift-200/30 transition-colors"
            placeholder="Buscar por nick ou login..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              setFiltraSemPasta((v) => !v);
              setPastaAtiva(null);
              setSelecionados(new Set());
            }}
            className={`text-sm px-3 py-2 rounded-lg border transition-colors font-medium whitespace-nowrap ${
              filtraSemPasta
                ? 'bg-[#3B136B] border-[#7B2CF5] text-[#CFA6FF]'
                : 'bg-void-900 border-void-800 text-rift-200/50 hover:text-rift-200 hover:border-void-700'
            }`}
          >
            Sem pasta
          </button>
          <button
            type="button"
            onClick={() => setFiltraSemNick((v) => !v)}
            className={`text-sm px-3 py-2 rounded-lg border transition-colors font-medium whitespace-nowrap ${
              filtraSemNick
                ? 'bg-[#3B136B] border-[#7B2CF5] text-[#CFA6FF]'
                : 'bg-void-900 border-void-800 text-rift-200/50 hover:text-rift-200 hover:border-void-700'
            }`}
          >
            Sem nick
          </button>
          <Select
            value={filtroElo}
            onChange={setFiltroElo}
            options={OPCOES_FILTRO.map((op) => ({
              value: op,
              label: op,
              color: op === 'Todos' ? undefined : corDoElo(op),
            }))}
          />
          <Select
            value={ordem}
            onChange={(v) => setOrdem(v as typeof ordem)}
            options={[
              { value: 'recentes', label: 'Mais recentes' },
              { value: 'antigas', label: 'Mais antigas' },
              { value: 'alfabetica', label: 'A → Z' },
              { value: 'z-a', label: 'Z → A' },
              ...(ordem === 'custom' ? [{ value: 'custom', label: 'Personalizada' }] : []),
            ]}
          />
        </div>

        {/* Lista */}
        {contasFiltradas.length === 0 ? (
          <p className="text-rift-200/40 text-center mt-20">
            {accounts.length === 0
              ? 'Nenhuma conta cadastrada ainda.'
              : 'Nenhuma conta encontrada.'}
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={contasFiltradas.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="flex flex-col gap-3">
                {contasFiltradas.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    senhaVisivel={senhasVisiveis.has(account.id)}
                    estaSelecionado={selecionados.has(account.id)}
                    dropdownAberto={dropdownAberto === account.id}
                    onToggleSenha={() => toggleSenha(account.id)}
                    onToggleSelecionado={() => toggleSelecionado(account.id)}
                    onLoginRiot={() => handleLoginRiot(account.login, account.senha)}
                    onCopiarLogin={() => copyToClipboard(account.login)}
                    onCopiarSenha={() => copyToClipboard(account.senha)}
                    onAbrirDropdown={() => setDropdownAberto(account.id)}
                    onFecharDropdown={() => setDropdownAberto(null)}
                    onEditar={() => {
                      abrirEdicao(account);
                      setDropdownAberto(null);
                    }}
                    onExcluir={() => {
                      setIdParaExcluir(account.id);
                      setDropdownAberto(null);
                    }}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {algumSelecionado && (
        <BulkActionBar
          count={selecionados.size}
          pastas={pastas}
          selectedIds={Array.from(selecionados)}
          onDeleteSelected={() => setConfirmarExclusaoLote(true)}
          onSetEloSelected={handleSetEloLote}
          onMoveTopastaSelected={handleMovePastaLote}
          onClearSelection={() => setSelecionados(new Set())}
          onAtualizarEloSelected={() => handleAtualizarElos(Array.from(selecionados))}
          leftOffset={sidebarAberta ? 208 : 48}
          hidden={sidebarAberta}
        />
      )}

      {modalAberto ? (
        <AddAccountModal
          contaParaEditar={contaParaEditar}
          onAdd={addAccount}
          onEdit={updateAccount}
          onClose={fecharModal}
        />
      ) : null}

      {importModalAberto ? (
        <ImportModal onClose={() => setImportModalAberto(false)} onImport={handleImport} />
      ) : null}

      {criarPastaAberto ? (
        <CreatePastaModal onClose={() => setCriarPastaAberto(false)} onCreate={addPasta} />
      ) : null}

      {idParaExcluir !== null ? (
        <ConfirmDialog
          mensagem="Mover essa conta para a lixeira?"
          onConfirmar={confirmarExclusao}
          onCancelar={() => setIdParaExcluir(null)}
        />
      ) : null}

      {confirmarExclusaoLote ? (
        <ConfirmDialog
          mensagem={`Mover ${selecionados.size} conta${selecionados.size !== 1 ? 's' : ''} para a lixeira?`}
          onConfirmar={handleExclusaoLote}
          onCancelar={() => setConfirmarExclusaoLote(false)}
        />
      ) : null}

      {configuracoesAberto ? <SettingsModal onClose={() => setConfiguracoesAberto(false)} /> : null}

      {lcuModal ? (
        <LcuModal
          nick={lcuModal.nick}
          dados={lcuModal.dados}
          erro={lcuModal.erro}
          carregando={lcuModal.carregando}
          accounts={accounts}
          onFechar={() => setLcuModal(null)}
          onVincular={handleVincularNick}
        />
      ) : null}
    </div>
  );
}
