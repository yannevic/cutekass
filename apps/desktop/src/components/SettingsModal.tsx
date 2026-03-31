import { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: Props) {
  const [chave, setChave] = useState('');
  const [caminhoClient, setCaminhoClient] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [salvandoClient, setSalvandoClient] = useState(false);
  const [salvoClient, setSalvoClient] = useState(false);

  useEffect(() => {
    window.electronAPI.getRiotKey().then(setChave);
    window.electronAPI.getRiotClientPath().then(setCaminhoClient);
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

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-void-900 border border-void-800 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 shadow-xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-rift-300">⚙️ Configurações</h2>

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
