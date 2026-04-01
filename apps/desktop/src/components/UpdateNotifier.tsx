import { useEffect, useState } from 'react';

type Status = 'idle' | 'available' | 'downloaded' | 'error';

export default function UpdateNotifier() {
  const [status, setStatus] = useState<Status>('idle');
  const [erro, setErro] = useState('');
  const [instalando, setInstalando] = useState(false);

  useEffect(() => {
    window.electronAPI.onUpdateAvailable(() => setStatus('available'));
    window.electronAPI.onUpdateDownloaded(() => setStatus('downloaded'));
    window.electronAPI.onUpdateError((msg) => {
      setErro(msg);
      setStatus('error');
    });
  }, []);

  async function handleInstall() {
    setInstalando(true);
    await window.electronAPI.installUpdate();
  }

  async function handleCheck() {
    setStatus('idle');
    await window.electronAPI.checkForUpdates();
  }

  if (status === 'idle') return null;

  function renderConteudo() {
    if (status === 'available') {
      return <p className="text-rift-200 text-sm">⬇️ Baixando atualização...</p>;
    }

    if (status === 'downloaded') {
      return (
        <div className="flex items-center gap-3">
          <p className="text-rift-200 text-sm">✅ Atualização pronta!</p>
          <button
            type="button"
            onClick={handleInstall}
            disabled={instalando}
            className="text-xs bg-rift-500 hover:bg-rift-400 text-white px-3 py-1 rounded-lg disabled:opacity-50"
          >
            {instalando ? 'Instalando...' : 'Instalar agora'}
          </button>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="flex items-center gap-3">
          <p className="text-red-400 text-sm">⚠️ Erro ao atualizar</p>
          <button
            type="button"
            onClick={handleCheck}
            className="text-xs bg-void-800 hover:bg-void-700 text-rift-200 px-3 py-1 rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-void-900 border border-void-800 rounded-xl px-4 py-3 shadow-lg">
      {renderConteudo()}
      {status === 'error' && erro ? (
        <p className="text-xs text-rift-200/40 mt-1 max-w-xs truncate">{erro}</p>
      ) : null}
    </div>
  );
}
