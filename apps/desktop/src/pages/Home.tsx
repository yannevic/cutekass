import { useState, useMemo, useEffect } from 'react';
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

const OPCOES_FILTRO = ['Todos', UNRANKED.nome, ...ELO_TIERS.map((t) => t.nome)];

export default function Home() {
  const {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    bulkDelete,
    bulkSetElo,
    bulkMovePasta,
    copyToClipboard,
  } = useAccounts();
  const { pastas, addPasta, updatePasta, deletePasta } = usePastas();

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
  const [dropdownAberto, setDropdownAberto] = useState<number | null>(null);
  const [ordem, setOrdem] = useState<'recentes' | 'alfabetica'>('recentes');
  const [configuracoesAberto, setConfiguracoesAberto] = useState(false);
  const [atualizandoElos, setAtualizandoElos] = useState(false);
  const [progressoElo, setProgressoElo] = useState<{ atual: number; total: number } | null>(null);
  const [erroAtualizacao, setErroAtualizacao] = useState('');
  const [erroLogin, setErroLogin] = useState<string>('');

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

  const contasFiltradas = useMemo(() => {
    return accounts
      .filter((acc) => {
        const termoBusca = busca.trim().toLowerCase();
        const passaBusca =
          !termoBusca ||
          acc.nick?.toLowerCase().includes(termoBusca) ||
          acc.login.toLowerCase().includes(termoBusca);

        function passaElo() {
          if (filtroElo === 'Todos') return true;
          if (filtroElo === UNRANKED.nome) return !acc.elo || acc.elo === UNRANKED.nome;
          return acc.elo?.startsWith(filtroElo) ?? false;
        }

        function passaPasta() {
          if (pastaAtiva === null) return true;
          return acc.pastaId === pastaAtiva;
        }

        return passaBusca && passaElo() && passaPasta();
      })
      .sort((a, b) => {
        if (ordem === 'alfabetica') {
          const nomeA = (a.nick || a.login).toLowerCase();
          const nomeB = (b.nick || b.login).toLowerCase();
          if (nomeA < nomeB) return -1;
          if (nomeA > nomeB) return 1;
          return 0;
        }
        return b.id - a.id;
      });
  }, [accounts, busca, filtroElo, pastaAtiva, ordem]);

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
    setSelecionados(new Set());
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
    for (let i = 0; i < parsed.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await addAccount({
        login: parsed[i].login,
        senha: parsed[i].senha,
        nick: parsed[i].nick ?? '',
        elo: '',
        observacoes: '',
        pastaId: pastaAtiva,
      });
    }
  }

  async function handleAtualizarTodosElos() {
    const comNick = accounts.filter((a) => a.nick && a.nick.includes('#'));
    if (comNick.length === 0) {
      setErroAtualizacao('Nenhuma conta possui nick no formato Nome#TAG.');
      return;
    }

    const chave = await window.electronAPI.getRiotKey();
    if (!chave) {
      setErroAtualizacao('Chave da API da Riot não configurada. Acesse as Configurações.');
      return;
    }

    setErroAtualizacao('');
    setAtualizandoElos(true);
    setProgressoElo({ atual: 0, total: comNick.length });

    let erros = 0;
    for (let i = 0; i < comNick.length; i += 1) {
      const conta = comNick[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        const elo = await window.electronAPI.fetchElo(conta.nick!);
        // eslint-disable-next-line no-await-in-loop
        await updateAccount({ ...conta, elo });
      } catch {
        erros += 1;
      }
      setProgressoElo({ atual: i + 1, total: comNick.length });
    }

    setAtualizandoElos(false);
    setProgressoElo(null);

    if (erros > 0) {
      setErroAtualizacao(
        `${erros} conta${erros !== 1 ? 's' : ''} não puderam ser atualizadas. Verifique se a chave da API ainda é válida.`
      );
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
        onRenamePasta={(id, nome, cor) => updatePasta(id, nome, cor)}
        onDeletePasta={(id) => deletePasta(id)}
        onConfiguracoes={() => setConfiguracoesAberto(true)}
      />

      <main className={`flex-1 overflow-y-auto p-6 ${algumSelecionado ? 'pb-20' : ''}`}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {contasFiltradas.length > 0 && algumSelecionado && (
              <input
                type="checkbox"
                className="w-4 h-4 accent-rift-300 cursor-pointer"
                checked={todosSelecionados}
                onChange={toggleSelecionarTodos}
              />
            )}
            <h2 className="text-xl font-bold text-rift-200">
              {pastaAtiva === null ? 'Todas as contas' : nomePastaAtiva}
            </h2>
          </div>
          <div className="flex gap-2 items-center">
            {progressoElo && (
              <span className="text-xs text-rift-200/50">
                {progressoElo.atual}/{progressoElo.total} atualizados
              </span>
            )}
            <button
              type="button"
              onClick={handleAtualizarTodosElos}
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
          <select
            className="bg-void-900 border border-void-800 rounded-lg px-3 py-2 text-sm text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 transition-colors"
            value={filtroElo}
            onChange={(e) => setFiltroElo(e.target.value)}
          >
            {OPCOES_FILTRO.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          <select
            className="bg-void-900 border border-void-800 rounded-lg px-3 py-2 text-sm text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 transition-colors"
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as 'recentes' | 'alfabetica')}
          >
            <option value="recentes">Mais recentes</option>
            <option value="alfabetica">A → Z</option>
          </select>
        </div>

        {/* Lista */}
        {contasFiltradas.length === 0 ? (
          <p className="text-rift-200/40 text-center mt-20">
            {accounts.length === 0
              ? 'Nenhuma conta cadastrada ainda.'
              : 'Nenhuma conta encontrada.'}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {contasFiltradas.map((account) => {
              const senhaVisivel = senhasVisiveis.has(account.id);
              const estaSelecionado = selecionados.has(account.id);
              return (
                <li
                  key={account.id}
                  className={`group/card bg-void-900 border rounded-xl p-4 flex items-center gap-4 transition-all ${
                    estaSelecionado
                      ? 'ring-2 ring-rift-300 border-rift-300/30'
                      : 'border-void-800 hover:border-void-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    className={`w-4 h-4 accent-rift-300 cursor-pointer shrink-0 transition-opacity ${
                      estaSelecionado ? 'opacity-100' : 'opacity-0 group-hover/card:opacity-100'
                    }`}
                    checked={estaSelecionado}
                    onChange={() => toggleSelecionado(account.id)}
                  />

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
                    {/* Olhinho */}
                    <button
                      type="button"
                      onClick={() => toggleSenha(account.id)}
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

                    {/* Logar */}
                    <button
                      type="button"
                      onClick={() => handleLoginRiot(account.login, account.senha)}
                      className="text-xs bg-rift-500 hover:bg-rift-400 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      title="Logar no Riot Client"
                    >
                      ▶ Logar
                    </button>

                    {/* Copiar login */}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(account.login)}
                      className="text-xs bg-void-800 hover:bg-void-700 text-rift-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Copiar login
                    </button>

                    {/* Copiar senha */}
                    <button
                      type="button"
                      onClick={() => copyToClipboard(account.senha)}
                      className="text-xs bg-void-800 hover:bg-void-700 text-rift-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Copiar senha
                    </button>

                    {/* 3 pontinhos */}
                    <div className="relative" data-dropdown>
                      <button
                        type="button"
                        onClick={() =>
                          setDropdownAberto(dropdownAberto === account.id ? null : account.id)
                        }
                        className="text-rift-200/40 hover:text-rift-200 p-1.5 rounded-lg hover:bg-void-800 transition-colors"
                        title="Mais opções"
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

                      {dropdownAberto === account.id && (
                        <div className="absolute right-0 top-8 z-50 bg-void-900 border border-void-800 rounded-xl shadow-lg shadow-black/50 py-1 min-w-30">
                          <button
                            type="button"
                            onClick={() => {
                              abrirEdicao(account);
                              setDropdownAberto(null);
                            }}
                            className="w-full text-left text-sm px-4 py-2 text-rift-200 hover:bg-void-800 transition-colors"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIdParaExcluir(account.id);
                              setDropdownAberto(null);
                            }}
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
            })}
          </ul>
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
    </div>
  );
}
