import { useState, useMemo } from 'react';
import type { Account } from '../types/account';

interface LcuDados {
  nivel: number;
  essenciaAzul: number;
  essenciaLaranja: number;
  numCampeoes: number;
  numSkins: number;
  skinsNomes: string[];
  nick: string;
}

interface LcuModalProps {
  nick: string;
  dados: LcuDados | null;
  erro: string;
  carregando: boolean;
  accounts: Account[];
  onFechar: () => void;
  onVincular: (conta: Account, nickLcu: string) => Promise<void>;
}

export default function LcuModal({
  nick,
  dados,
  erro,
  carregando,
  accounts,
  onFechar,
  onVincular,
}: LcuModalProps) {
  const [etapa, setEtapa] = useState<'info' | 'vincular'>('info');
  const [busca, setBusca] = useState('');
  const [vinculando, setVinculando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erroVincular, setErroVincular] = useState('');
  const [buscaSkin, setBuscaSkin] = useState('');
  const [gerandoColagem, setGerandoColagem] = useState(false);
  const [progressoColagem, setProgressoColagem] = useState<{ atual: number; total: number } | null>(
    null
  );
  const [erroColagem, setErroColagem] = useState('');
  const [sucessoColagem, setSucessoColagem] = useState('');

  const contasFiltradas = useMemo(() => {
    const semNick = accounts.filter((a) => !a.nick);
    const termo = busca.trim().toLowerCase();
    if (!termo) return semNick;
    return semNick.filter((a) => a.login.toLowerCase().includes(termo));
  }, [accounts, busca]);

  async function handleVincular(conta: Account) {
    if (!dados?.nick) return;
    setVinculando(true);
    setErroVincular('');
    try {
      await onVincular(conta, dados.nick);
      setSucesso(`Nick vinculado a ${conta.login}!`);
      setTimeout(() => {
        setSucesso('');
        setEtapa('info');
        setBusca('');
      }, 1800);
    } catch (e) {
      const raw =
        e instanceof Error
          ? e.message
          : typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message: unknown }).message)
            : String(e);
      const msg = raw.replace(/^Error invoking remote method '[^']+': Error: /, '');
      setErroVincular(msg);
    } finally {
      setVinculando(false);
    }
  }

  async function handleGerarColagem() {
    if (!dados?.skinsNomes?.length) return;
    setGerandoColagem(true);
    setErroColagem('');
    setSucessoColagem('');
    setProgressoColagem({ atual: 0, total: dados.skinsNomes.length });
    try {
      const nomeArquivo = await window.electronAPI.gerarColagemSkins(dados.skinsNomes, dados.nick);
      setSucessoColagem(`Pasta salva em Downloads: ${nomeArquivo}`);
    } catch (e) {
      const raw =
        e instanceof Error
          ? e.message
          : typeof e === 'object' && e !== null && 'message' in e
            ? String((e as { message: unknown }).message)
            : String(e);
      const msg = raw.replace(/^Error invoking remote method '[^']+': Error: /, '');
      setErroColagem(msg);
    } finally {
      setGerandoColagem(false);
      setProgressoColagem(null);
    }
  }

  function handleCopiarNick() {
    if (dados?.nick) window.electronAPI.copyToClipboard(dados.nick);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-void-900 border border-void-800 rounded-2xl p-6 w-80 shadow-2xl shadow-black/60 flex flex-col gap-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          {etapa === 'vincular' ? (
            <button
              type="button"
              onClick={() => {
                setEtapa('info');
                setBusca('');
                setSucesso('');
              }}
              className="text-rift-200/40 hover:text-rift-200 transition-colors text-sm"
            >
              ← Voltar
            </button>
          ) : (
            <h2 className="font-bold text-rift-200 text-base">🔍 {nick}</h2>
          )}
          <button
            type="button"
            onClick={onFechar}
            className="text-rift-200/40 hover:text-rift-200 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* ── Etapa 1: infos ── */}
        {etapa === 'info' && (
          <>
            {carregando && (
              <p className="text-rift-200/50 text-sm text-center py-4">Lendo cliente...</p>
            )}

            {erro && !carregando && <p className="text-red-400 text-sm text-center">{erro}</p>}

            {dados && !carregando && (
              <>
                {/* Nick#tag com copiar */}
                {dados.nick ? (
                  <div className="flex items-center justify-between bg-void-800/60 rounded-xl px-4 py-2.5">
                    <span className="text-sm text-rift-200/70 font-mono">{dados.nick}</span>
                    <button
                      type="button"
                      onClick={handleCopiarNick}
                      className="text-rift-200/40 hover:text-rift-200 transition-colors text-xs ml-2"
                      title="Copiar nick"
                    >
                      📋
                    </button>
                  </div>
                ) : null}

                <ul className="flex flex-col gap-3">
                  {[
                    { icone: '🎮', label: 'Nível', valor: dados.nivel },
                    { icone: '🏆', label: 'Campeões', valor: dados.numCampeoes },
                    {
                      icone: '💙',
                      label: 'Essência Azul',
                      valor: dados.essenciaAzul.toLocaleString('pt-BR'),
                    },
                    {
                      icone: '🧡',
                      label: 'Essência Laranja',
                      valor: dados.essenciaLaranja.toLocaleString('pt-BR'),
                    },
                    { icone: '✨', label: 'Skins', valor: dados.numSkins },
                  ].map(({ icone, label, valor }) => (
                    <li
                      key={label}
                      className="flex items-center justify-between bg-void-800/60 rounded-xl px-4 py-2.5"
                    >
                      <span className="text-sm text-rift-200/70">
                        {icone} {label}
                      </span>
                      <span className="font-bold text-rift-200">{valor}</span>
                    </li>
                  ))}
                </ul>

                {dados.skinsNomes.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-rift-200/40 font-semibold uppercase tracking-wide shrink-0">
                        Lista de skins
                      </p>
                      <input
                        className="flex-1 min-w-0 bg-void-800 border border-void-700 rounded-lg px-2 py-1 text-xs text-rift-200 outline-none focus:ring-1 focus:ring-rift-400 placeholder-rift-200/30 transition-colors"
                        placeholder="Buscar skin..."
                        value={buscaSkin}
                        onChange={(e) => setBuscaSkin(e.target.value)}
                      />
                    </div>
                    <ul
                      className="flex flex-col gap-1 max-h-40 overflow-y-auto scrollbar-custom pr-1"
                      style={{ scrollbarWidth: 'thin', scrollbarColor: '#5a1fa8 transparent' }}
                    >
                      {dados.skinsNomes
                        .filter((nome) =>
                          nome.toLowerCase().includes(buscaSkin.trim().toLowerCase())
                        )
                        .map((nome) => (
                          <li
                            key={nome}
                            className="text-xs text-rift-200/70 bg-void-800/60 rounded-lg px-3 py-1.5"
                          >
                            {nome}
                          </li>
                        ))}
                      {dados.skinsNomes.filter((nome) =>
                        nome.toLowerCase().includes(buscaSkin.trim().toLowerCase())
                      ).length === 0 && (
                        <li className="text-xs text-rift-200/30 text-center py-2">
                          Nenhuma skin encontrada.
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {dados.skinsNomes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {gerandoColagem && progressoColagem && (
                      <div className="flex flex-col gap-1">
                        <div className="w-full bg-void-800 rounded-full h-1.5">
                          <div
                            className="bg-rift-500 h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.round((progressoColagem.atual / progressoColagem.total) * 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-rift-200/40 text-center">Gerando colagem...</p>
                      </div>
                    )}
                    {erroColagem && (
                      <p className="text-red-400 text-xs text-center">{erroColagem}</p>
                    )}
                    {sucessoColagem && (
                      <p className="text-green-400 text-xs text-center">{sucessoColagem}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleGerarColagem}
                      disabled={gerandoColagem}
                      className="w-full text-sm bg-void-800 hover:bg-void-700 border border-void-700 hover:border-rift-500 text-rift-200 font-semibold py-2 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {gerandoColagem ? '⏳ Gerando...' : '🖼️ Gerar colagem'}
                    </button>
                  </div>
                )}

                {dados.nick &&
                !accounts.some((a) => a.nick?.toLowerCase() === dados.nick.toLowerCase()) ? (
                  <button
                    type="button"
                    onClick={() => setEtapa('vincular')}
                    className="w-full text-sm bg-rift-500 hover:bg-rift-400 text-white font-semibold py-2 rounded-xl transition-colors"
                  >
                    🔗 Vincular a uma conta
                  </button>
                ) : null}
              </>
            )}

            <button
              type="button"
              onClick={onFechar}
              className="text-sm text-rift-200/40 hover:text-rift-200 transition-colors text-center"
            >
              Fechar
            </button>
          </>
        )}

        {/* ── Etapa 2: vincular ── */}

        {etapa === 'vincular' && (
          <>
            <p className="text-xs text-rift-200/50 -mt-2">
              Selecione a conta para salvar o nick{' '}
              <span className="text-rift-300 font-mono">{dados?.nick}</span>
            </p>

            <input
              className="bg-void-800 border border-void-700 rounded-lg px-3 py-2 text-sm text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 placeholder-rift-200/30 transition-colors"
              placeholder="Buscar por login..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              autoFocus
            />
            {erroVincular ? (
              <p className="text-red-400 text-xs text-center -mt-2">{erroVincular}</p>
            ) : null}

            {sucesso ? (
              <p className="text-green-400 text-sm text-center py-2">{sucesso}</p>
            ) : (
              <ul className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                {contasFiltradas.length === 0 ? (
                  <li className="text-rift-200/40 text-sm text-center py-4">
                    Nenhuma conta encontrada.
                  </li>
                ) : (
                  contasFiltradas.map((conta) => (
                    <li key={conta.id}>
                      <button
                        type="button"
                        disabled={vinculando}
                        onClick={() => handleVincular(conta)}
                        className="w-full text-left bg-void-800/60 hover:bg-void-700/60 rounded-xl px-4 py-2.5 transition-colors disabled:opacity-50"
                      >
                        <p className="text-sm font-semibold text-rift-200">{conta.login}</p>
                        {conta.nick ? (
                          <p className="text-xs text-rift-200/40">{conta.nick}</p>
                        ) : null}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
