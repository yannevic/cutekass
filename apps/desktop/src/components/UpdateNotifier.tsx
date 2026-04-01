import { useEffect, useState } from 'react';

type Status = 'idle' | 'checking' | 'available' | 'downloaded' | 'error' | 'up-to-date';

const RELEASE_URL = 'https://github.com/yannevic/cutekass/releases/latest';

export default function UpdateNotifier() {
  const [status, setStatus] = useState<Status>('idle');
  const [erro, setErro] = useState('');
  const [instalando, setInstalando] = useState(false);
  const [erroExpandido, setErroExpandido] = useState(false);

  useEffect(() => {
    window.electronAPI.onUpdateAvailable(() => setStatus('available'));
    window.electronAPI.onUpdateNotAvailable(() => setStatus('up-to-date'));
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
    setErro('');
    setErroExpandido(false);
    setStatus('checking');
    await window.electronAPI.checkForUpdates();
  }

  function handleBaixarManual() {
    window.electronAPI.copyToClipboard(RELEASE_URL);
  }

  // Botão flutuante quando idle — permite buscar atualizações manualmente
  if (status === 'idle' || status === 'checking') {
    return (
      <button
        type="button"
        onClick={handleCheck}
        disabled={status === 'checking'}
        className="fixed bottom-4 right-4 z-50 rounded-xl px-3 py-2 text-xs shadow-lg disabled:opacity-60 transition-colors"
        style={{
          backgroundColor: '#1E0A38',
          border: '1px solid #3B136B',
          color: '#5A1FA8',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = '#5A1FA8';
        }}
      >
        {status === 'checking' ? '🔄 Verificando...' : '🔄 Buscar atualizações'}
      </button>
    );
  }
  if (status === 'up-to-date') {
    return (
      <button
        type="button"
        onClick={() => setStatus('idle')}
        className="fixed bottom-4 right-4 z-50 rounded-xl px-3 py-2 text-xs shadow-lg transition-colors"
        style={{
          backgroundColor: '#1E0A38',
          border: '1px solid #3B136B',
          color: '#CFA6FF',
        }}
      >
        ✅ Tudo atualizado!
      </button>
    );
  }

  if (status === 'error') {
    return (
      <div
        className="fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 shadow-lg flex flex-col gap-2"
        style={{ backgroundColor: '#1E0A38', border: '1px solid #3B136B', maxWidth: '320px' }}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#f87171' }}>
            ⚠️ Erro ao verificar atualizações
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="text-xs px-2 py-0.5 rounded shrink-0"
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

        {/* Erro expansível */}
        {erro ? (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setErroExpandido(!erroExpandido)}
              className="text-xs self-start transition-colors"
              style={{ color: '#5A3A8A' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
              }}
            >
              {erroExpandido ? '▲ Ocultar erro' : '▼ Ver erro completo'}
            </button>
            {erroExpandido && (
              <pre
                className="text-xs font-mono rounded-lg px-3 py-2 whitespace-pre-wrap break-all max-h-32 overflow-y-auto"
                style={{
                  backgroundColor: '#0B0F1A',
                  color: '#f87171',
                  border: '1px solid #3B136B',
                }}
              >
                {erro}
              </pre>
            )}
          </div>
        ) : null}

        {/* Ações */}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCheck}
            className="text-xs px-3 py-1 rounded-lg transition-colors"
            style={{ backgroundColor: '#3B136B', color: '#CFA6FF' }}
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={handleBaixarManual}
            className="text-xs px-3 py-1 rounded-lg transition-colors"
            style={{ backgroundColor: '#0B0F1A', color: '#CFA6FF', border: '1px solid #3B136B' }}
            title="Copia o link do release para o clipboard"
          >
            📋 Copiar link para baixar
          </button>
        </div>
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
