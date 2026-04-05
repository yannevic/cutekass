import { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

interface Backup {
  id: number;
  criadoEm: string;
  conteudo: string;
}

export default function SettingsModal({ onClose }: Props) {
  const [chave, setChave] = useState('');
  const [caminhoClient, setCaminhoClient] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [salvandoClient, setSalvandoClient] = useState(false);
  const [salvoClient, setSalvoClient] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [backupExpandido, setBackupExpandido] = useState<number | null>(null);
  const [copiado, setCopiado] = useState<number | null>(null);
  const [exportandoBackup, setExportandoBackup] = useState(false);
  const [exportadoBackup, setExportadoBackup] = useState(false);

  useEffect(() => {
    window.electronAPI.getRiotKey().then(setChave);
    window.electronAPI.getRiotClientPath().then(setCaminhoClient);
    window.electronAPI.listarHistoricoBackup().then(setBackups);
  }, []);

  async function handleSalvar() {
    setSalvando(true);
    await window.electronAPI.saveRiotKey(chave);
    setSalvando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  async function handleSalvarClient() {
    setSalvandoClient(true);
    await window.electronAPI.saveRiotClientPath(caminhoClient);
    setSalvandoClient(false);
    setSalvoClient(true);
    setTimeout(() => setSalvoClient(false), 2000);
  }

  function handleLimpar() {
    setChave('');
    window.electronAPI.saveRiotKey('');
  }

  async function handleCopiarBackup(id: number, conteudo: string) {
    await window.electronAPI.copyToClipboard(conteudo);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  }

  async function handleExportarTudo() {
    setExportandoBackup(true);
    const ids = await window.electronAPI.getAccounts().then((acc) => acc.map((a) => a.id));
    await window.electronAPI.exportAccounts(ids);
    setExportandoBackup(false);
    setExportadoBackup(true);
    setTimeout(() => setExportadoBackup(false), 3000);
  }

  function formatarData(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-void-900 border border-void-800 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-xl shadow-black/50 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-rift-300">⚙️ Configurações</h2>

        {/* Chave da API */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-rift-200/70 font-medium">Chave da API da Riot</label>
          <p className="text-xs text-rift-200/40">
            Gere sua chave gratuita em{' '}
            <span className="text-rift-400">developer.riotgames.com</span> e cole aqui. Ela expira a
            cada 24h.
          </p>
          <input
            className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 font-mono text-sm placeholder-rift-200/20 transition-colors"
            value={chave}
            onChange={(e) => setChave(e.target.value)}
            placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSalvar}
              disabled={salvando}
              className="flex-1 px-4 py-2 rounded-lg bg-rift-500 hover:bg-rift-400 text-white font-semibold text-sm disabled:opacity-50 transition-colors"
            >
              {salvo ? '✓ Salvo!' : salvando ? 'Salvando...' : 'Salvar chave'}
            </button>
            {chave && (
              <button
                type="button"
                onClick={handleLimpar}
                className="px-4 py-2 rounded-lg bg-void-800 hover:bg-void-700 text-sm text-rift-200/60 transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-void-800" />

        {/* Caminho do client */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-rift-200/70 font-medium">Caminho do Riot Client</label>
          <p className="text-xs text-rift-200/40">
            Cole o caminho completo do executável do Riot Client. Usado para abrir o client
            automaticamente ao clicar em &ldquo;Logar&rdquo;.
          </p>
          <p className="text-xs text-rift-200/25 font-mono bg-void-950 rounded px-2 py-1 border border-void-800">
            Exemplo: C:\Riot Games\Riot Client\RiotClientServices.exe
          </p>
          <p className="text-xs text-rift-200/40">
            Para encontrar: clique com o botão direito no ícone do Riot Client no desktop →{' '}
            <span className="text-rift-200/70">Propriedades</span> → copie o campo{' '}
            <span className="text-rift-200/70">Destino</span>.
          </p>
          <input
            className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 outline-none focus:ring-2 focus:ring-rift-400 font-mono text-sm placeholder-rift-200/20 transition-colors"
            value={caminhoClient}
            onChange={(e) => setCaminhoClient(e.target.value)}
            placeholder="C:\Riot Games\Riot Client\RiotClientServices.exe"
          />
          <button
            type="button"
            onClick={handleSalvarClient}
            disabled={salvandoClient}
            className="px-4 py-2 rounded-lg bg-rift-500 hover:bg-rift-400 text-white font-semibold text-sm disabled:opacity-50 transition-colors"
          >
            {salvoClient ? '✓ Salvo!' : salvandoClient ? 'Salvando...' : 'Salvar caminho'}
          </button>
        </div>

        <div className="border-t border-void-800" />

        {/* Aviso de backup antes de formatar */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-rift-200/70 font-medium">🖥️ Vai formatar o PC?</label>
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-4 py-3 flex flex-col gap-2">
            <p className="text-yellow-200/80 text-xs leading-relaxed">
              ⚠️ O banco de dados e a chave de criptografia ficam salvos neste computador. Se você
              formatar sem exportar,{' '}
              <span className="text-yellow-300 font-semibold">todas as contas serão perdidas</span>.
            </p>
            <p className="text-yellow-200/60 text-xs leading-relaxed">
              Exporte suas contas antes de formatar. O arquivo gerado contém login, senha e nick de
              todas as contas — suficiente para reimportar tudo depois.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportarTudo}
            disabled={exportandoBackup}
            className="px-4 py-2 rounded-lg bg-void-800 hover:bg-void-700 disabled:opacity-50 text-sm text-rift-200 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {exportadoBackup
              ? '✓ Exportado! Salve o arquivo em local seguro.'
              : exportandoBackup
                ? 'Exportando...'
                : '↓ Exportar todas as contas agora'}
          </button>
        </div>

        <div className="border-t border-void-800" />

        {/* Histórico de backup */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-rift-200/70 font-medium">💾 Histórico de backup</label>
          <p className="text-xs text-rift-200/40">
            Últimas 3 sessões salvas automaticamente. Use para recuperar contas se algo der errado.
          </p>

          {backups.length === 0 ? (
            <p className="text-xs text-rift-200/30 italic">Nenhum backup salvo ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {backups.map((backup) => (
                <div key={backup.id} className="rounded-lg border border-void-800 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-void-950">
                    <span className="text-xs text-rift-200/60">
                      {formatarData(backup.criadoEm)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopiarBackup(backup.id, backup.conteudo)}
                        className="text-xs px-2 py-0.5 rounded bg-void-800 hover:bg-void-700 text-rift-200/70 transition-colors"
                      >
                        {copiado === backup.id ? '✓ Copiado!' : 'Copiar'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setBackupExpandido(backupExpandido === backup.id ? null : backup.id)
                        }
                        className="text-xs px-2 py-0.5 rounded bg-void-800 hover:bg-void-700 text-rift-200/70 transition-colors"
                      >
                        {backupExpandido === backup.id ? 'Fechar' : 'Ver'}
                      </button>
                    </div>
                  </div>

                  {backupExpandido === backup.id && (
                    <pre className="text-xs text-rift-200/50 font-mono px-3 py-2 bg-void-950/50 border-t border-void-800 whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                      {backup.conteudo}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-void-800 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg bg-void-800 hover:bg-void-700 text-sm text-rift-200/60 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
