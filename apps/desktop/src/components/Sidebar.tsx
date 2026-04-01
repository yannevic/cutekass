import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Pasta } from '../types/pasta';

interface SidebarProps {
  pastas: Pasta[];
  pastaAtiva: number | null;
  onSelecionarPasta: (id: number | null) => void;
  onNovaPasta: () => void;
  onRenamePasta: (id: number, nome: string, cor: string) => void;
  onDeletePasta: (id: number) => void;
  onConfiguracoes: () => void;
}

export default function Sidebar({
  pastas,
  pastaAtiva,
  onSelecionarPasta,
  onNovaPasta,
  onRenamePasta,
  onDeletePasta,
  onConfiguracoes,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const naLixeira = location.pathname === '/trash';

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');
  const [confirmandoDeleteId, setConfirmandoDeleteId] = useState<number | null>(null);
  const [versaoApp, setVersaoApp] = useState('');

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setVersaoApp);
  }, []);

  function iniciarEdicao(pasta: Pasta) {
    setEditandoId(pasta.id);
    setNomeEditando(pasta.nome);
  }

  function confirmarRename(pasta: Pasta) {
    const nomeTrimado = nomeEditando.trim();
    if (nomeTrimado && nomeTrimado !== pasta.nome) {
      onRenamePasta(pasta.id, nomeTrimado, pasta.cor);
    }
    setEditandoId(null);
    setNomeEditando('');
  }

  function handleDeletePasta(id: number) {
    onDeletePasta(id);
    setConfirmandoDeleteId(null);
  }

  return (
    <aside
      className="group w-12 hover:w-52 shrink-0 h-screen flex flex-col border-r transition-all duration-300 overflow-hidden"
      style={{ backgroundColor: '#12082A', borderColor: '#3B136B' }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center shrink-0 border-b" style={{ borderColor: '#3B136B' }}>
        <span className="w-12 flex items-center justify-center shrink-0 text-xl leading-none">
          🌸
        </span>
        <span
          className="font-bold text-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ color: '#CFA6FF' }}
        >
          Continhas
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-hidden py-2 flex flex-col gap-1">
        {/* Todas as contas */}
        <button
          type="button"
          onClick={() => {
            onSelecionarPasta(null);
            navigate('/');
          }}
          className={`w-full flex items-center py-2 rounded-lg text-sm font-medium transition-colors mx-1 ${
            pastaAtiva === null && !naLixeira
              ? 'group-hover:bg-[#3B136B] text-[#CFA6FF]'
              : 'text-[#7B5EA7] hover:bg-[#1E0A38] hover:text-[#CFA6FF]'
          }`}
        >
          {/* w-10 = 40px → ícone centralizado dentro dos 48px da sidebar fechada */}
          <span className="w-10 flex items-center justify-center shrink-0 text-base">🗂</span>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-2">
            Todas as contas
          </span>
        </button>

        {/* Pastas */}
        {pastas.map((pasta) => (
          <div
            key={pasta.id}
            className="group/pasta flex flex-col rounded-lg text-sm transition-colors mx-1"
            style={
              pastaAtiva === pasta.id && !naLixeira
                ? { backgroundColor: '#3B136B', color: '#CFA6FF' }
                : { color: '#7B5EA7' }
            }
          >
            <div className="flex items-center py-2">
              {editandoId === pasta.id ? (
                <>
                  <span className="w-10 shrink-0" />
                  <input
                    className="flex-1 text-sm px-2 py-0.5 rounded outline-none min-w-0 mr-2"
                    style={{
                      backgroundColor: '#2A1050',
                      color: '#CFA6FF',
                      border: '1px solid #7B2CF5',
                    }}
                    value={nomeEditando}
                    autoFocus
                    onChange={(e) => setNomeEditando(e.target.value)}
                    onBlur={() => confirmarRename(pasta)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmarRename(pasta);
                      if (e.key === 'Escape') {
                        setEditandoId(null);
                        setNomeEditando('');
                      }
                    }}
                  />
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onSelecionarPasta(pasta.id);
                      navigate('/');
                    }}
                    className="flex items-center flex-1 min-w-0 text-left"
                  >
                    <span className="w-10 flex items-center justify-center shrink-0">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pasta.cor }}
                      />
                    </span>
                    <span className="truncate whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {pasta.nome}
                    </span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/pasta:opacity-100 transition-opacity pr-1">
                    <button
                      type="button"
                      onClick={() => iniciarEdicao(pasta)}
                      className="p-0.5 rounded transition-colors"
                      style={{ color: '#5A3A8A' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
                      }}
                      title="Renomear"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoDeleteId(pasta.id)}
                      className="p-0.5 rounded transition-colors"
                      style={{ color: '#5A3A8A' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = '#f87171';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
                      }}
                      title="Deletar pasta"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Confirmação inline */}
            {confirmandoDeleteId === pasta.id && (
              <div
                className="mx-2 mb-2 px-2 py-2 rounded-lg flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: '#1E0A38', border: '1px solid #3B136B' }}
              >
                <p className="text-xs whitespace-nowrap" style={{ color: '#CFA6FF' }}>
                  Deletar{' '}
                  <span className="font-semibold" style={{ color: '#D94BFF' }}>
                    {pasta.nome}
                  </span>
                  ?
                </p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleDeletePasta(pasta.id)}
                    className="flex-1 text-xs px-2 py-1 rounded transition-colors"
                    style={{ backgroundColor: '#7B1FA2', color: '#fff' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#9C27B0';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7B1FA2';
                    }}
                  >
                    Deletar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoDeleteId(null)}
                    className="flex-1 text-xs px-2 py-1 rounded transition-colors"
                    style={{ backgroundColor: '#2A2F3A', color: '#CFA6FF' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3B136B';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2A2F3A';
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Rodapé */}
      <div
        className="py-2 flex flex-col gap-1 shrink-0 border-t"
        style={{ borderColor: '#3B136B' }}
      >
        {/* Nova pasta */}
        <button
          type="button"
          onClick={onNovaPasta}
          className="w-full flex items-center py-2 rounded-lg text-sm transition-colors mx-1"
          style={{ color: '#5A3A8A' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E0A38';
            (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
          }}
        >
          <span className="w-10 flex items-center justify-center shrink-0 text-base">＋</span>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-2">
            Nova pasta
          </span>
        </button>

        {/* Lixeira */}
        <button
          type="button"
          onClick={() => navigate('/trash')}
          className="w-full flex items-center py-2 rounded-lg text-sm transition-colors mx-1"
          style={
            naLixeira ? { backgroundColor: '#3B136B', color: '#CFA6FF' } : { color: '#5A3A8A' }
          }
          onMouseEnter={(e) => {
            if (!naLixeira) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E0A38';
              (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
            }
          }}
          onMouseLeave={(e) => {
            if (!naLixeira) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
            }
          }}
        >
          <span className="w-10 flex items-center justify-center shrink-0 text-base">🗑</span>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-2">
            Lixeira
          </span>
        </button>

        {/* Configurações */}
        <button
          type="button"
          onClick={onConfiguracoes}
          className="w-full flex items-center py-2 rounded-lg text-sm transition-colors mx-1"
          style={{ color: '#5A3A8A' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E0A38';
            (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
          }}
        >
          <span className="w-10 flex items-center justify-center shrink-0">
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
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </span>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-2">
            Configurações
          </span>
        </button>

        {/* Versão + Made by */}
        <div
          className="flex items-center py-2 mx-1 mt-1 border-t"
          style={{ borderColor: '#3B136B' }}
        >
          <span
            className="w-10 flex items-center justify-center shrink-0 text-xs"
            style={{ color: '#3B136B' }}
          >
            v
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col pr-2">
            <span className="text-xs whitespace-nowrap" style={{ color: '#5A3A8A' }}>
              v{versaoApp}
            </span>
            <span className="text-xs whitespace-nowrap" style={{ color: '#3B136B' }}>
              Made by Nana 🌸
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
