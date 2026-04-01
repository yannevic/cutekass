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

  if (status === 'error') {
    return (
      <div
        className="fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 shadow-lg flex flex-col gap-2"
        style={{ backgroundColor: '#1E0A38', border: '1px solid #3B136B' }}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#f87171' }}>
            ⚠️ Erro ao verificar atualizações
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="text-xs px-2 py-0.5 rounded"
            style={{ color: '#5A3A8A' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
            }}
          >
            ✕
          </button>
        </div>
        {erro ? (
          <p className="text-xs max-w-xs truncate" style={{ color: '#5A3A8A' }}>
            {erro}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleCheck}
          className="text-xs px-3 py-1 rounded-lg self-start"
          style={{ backgroundColor: '#3B136B', color: '#CFA6FF' }}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3"
      style={{ backgroundColor: '#1E0A38', border: '1px solid #3B136B' }}
    >
      {status === 'available' && (
        <p className="text-sm" style={{ color: '#CFA6FF' }}>
          ⬇️ Baixando atualização...
        </p>
      )}
      {status === 'downloaded' && (
        <>
          <p className="text-sm" style={{ color: '#CFA6FF' }}>
            ✅ Atualização pronta!
          </p>
          <button
            type="button"
            onClick={handleInstall}
            disabled={instalando}
            className="text-xs px-3 py-1 rounded-lg disabled:opacity-50"
            style={{ backgroundColor: '#7B2CF5', color: '#fff' }}
          >
            {instalando ? 'Instalando...' : 'Instalar agora'}
          </button>
        </>
      )}
    </div>
  );
}
