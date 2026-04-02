import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Pasta } from '../types/pasta';
import type { UpdateStatus } from './UpdateNotifier';
import { PASTA_ICONS, getIcon } from '../lib/pastaIcons';

const RELEASE_URL = 'https://github.com/yannevic/cutekass/releases/latest';

interface SidebarProps {
  pastas: Pasta[];
  pastaAtiva: number | null;
  onSelecionarPasta: (id: number | null) => void;
  onNovaPasta: () => void;
  onRenamePasta: (id: number, nome: string, cor: string, icone: string) => void;
  onDeletePasta: (id: number) => void;
  onReorderPastas: (ids: number[]) => void;
  onConfiguracoes: () => void;
  updateStatus: UpdateStatus;
  updateErro: string;
  onUpdateStatus: (status: UpdateStatus) => void;
  onUpdateErro: (msg: string) => void;
  onHoverChange: (hover: boolean) => void;
}

// ─── Componente de nome com scroll ping-pong ──────────────────────────────────

function NomePasta({ nome }: { nome: string }) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef = useRef(0);
  const [pos, setPos] = useState(0);
  const [duracao, setDuracao] = useState(0);

  function pararAnim() {
    if (animRef.current) clearTimeout(animRef.current);
    posRef.current = 0;
    setPos(0);
    setDuracao(0);
  }

  function iniciarAnim() {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;
    const overflow = text.scrollWidth - container.offsetWidth;
    if (overflow <= 4) return;

    let indo = true;

    function passo(atual: number) {
      const destino = indo ? overflow : 0;
      const dist = Math.abs(destino - atual);
      const dur = dist * 18;

      setDuracao(dur);
      setPos(destino);
      posRef.current = destino;

      animRef.current = setTimeout(() => {
        indo = !indo;
        passo(destino);
      }, dur + 700);
    }

    passo(0);
  }

  return (
    <span
      ref={containerRef}
      className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-1 min-w-0"
      onMouseEnter={iniciarAnim}
      onMouseLeave={pararAnim}
    >
      <span
        ref={textRef}
        style={{
          display: 'inline-block',
          transform: `translateX(-${pos}px)`,
          transition: duracao > 0 ? `transform ${duracao}ms linear` : 'none',
        }}
      >
        {nome}
      </span>
    </span>
  );
}

// ─── PastaItem ────────────────────────────────────────────────────────────────

interface PastaItemProps {
  pasta: Pasta;
  ativa: boolean;
  editandoId: number | null;
  nomeEditando: string;
  iconeEditando: string;
  corEditando: string;
  sidebarAberta: boolean;
  confirmandoDeleteId: number | null;
  onSelecionar: () => void;
  onIniciarEdicao: () => void;
  onConfirmarRename: () => void;
  onCancelarEdicao: () => void;
  onNomeChange: (v: string) => void;
  onIconeChange: (v: string) => void;
  onConfirmarDelete: () => void;
  onPedirDelete: () => void;
  onCancelarDelete: () => void;
}

function PastaItem({
  pasta,
  ativa,
  editandoId,
  nomeEditando,
  iconeEditando,
  sidebarAberta,
  confirmandoDeleteId,
  onSelecionar,
  onIniciarEdicao,
  onConfirmarRename,
  onCancelarEdicao,
  onNomeChange,
  onIconeChange,
  onConfirmarDelete,
  onPedirDelete,
  onCancelarDelete,
}: PastaItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: pasta.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const editando = editandoId === pasta.id;
  const confirmando = confirmandoDeleteId === pasta.id;
  const icon = getIcon(pasta.icone ?? 'folder');

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(ativa && !editando
          ? { backgroundColor: '#3B136B', color: '#CFA6FF' }
          : { color: '#7B5EA7' }),
      }}
      className="group/pasta flex flex-col rounded-lg text-sm transition-colors mx-1"
    >
      <div className="flex items-center py-2">
        {/* Handle drag */}
        {!editando && sidebarAberta && (
          <button
            type="button"
            className="shrink-0 flex items-center justify-center w-10 cursor-grab active:cursor-grabbing touch-none text-[#3B136B] hover:text-[#7B2CF5] transition-colors"
            {...attributes}
            {...listeners}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 h-3"
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
        )}

        {editando ? (
          <div className="flex flex-col gap-2 flex-1 pr-2 pl-1 py-1">
            <input
              className="w-full text-sm px-2 py-1 rounded outline-none"
              style={{ backgroundColor: '#2A1050', color: '#CFA6FF', border: '1px solid #7B2CF5' }}
              value={nomeEditando}
              autoFocus
              onChange={(e) => onNomeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirmarRename();
                if (e.key === 'Escape') onCancelarEdicao();
              }}
            />

            {/* Picker de ícone inline */}
            <div className="flex gap-1 flex-wrap">
              {PASTA_ICONS.map((ic) => (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() => onIconeChange(ic.id)}
                  title={ic.label}
                  className="w-7 h-7 rounded flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: iconeEditando === ic.id ? `${pasta.cor}33` : 'transparent',
                    border:
                      iconeEditando === ic.id
                        ? `1.5px solid ${pasta.cor}`
                        : '1.5px solid transparent',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: iconeEditando === ic.id ? pasta.cor : '#5A3A8A' }}
                    dangerouslySetInnerHTML={{ __html: ic.svg }}
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={onConfirmarRename}
                className="flex-1 text-xs py-1 rounded transition-colors"
                style={{ backgroundColor: '#7B2CF5', color: '#fff' }}
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={onCancelarEdicao}
                className="flex-1 text-xs py-1 rounded transition-colors"
                style={{ backgroundColor: '#2A2F3A', color: '#CFA6FF' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onSelecionar}
              className="flex items-center flex-1 min-w-0 text-left gap-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 shrink-0 ${sidebarAberta ? 'ml-1 mr-2' : 'ml-3'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: pasta.cor }}
                dangerouslySetInnerHTML={{ __html: icon.svg }}
              />
              <NomePasta nome={pasta.nome} />
            </button>

            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover/pasta:opacity-100 transition-opacity pr-1">
              <button
                type="button"
                onClick={onIniciarEdicao}
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
                onClick={onPedirDelete}
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

      {confirmando && (
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
              onClick={onConfirmarDelete}
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
              onClick={onCancelarDelete}
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
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({
  pastas,
  pastaAtiva,
  updateStatus,
  updateErro,
  onSelecionarPasta,
  onNovaPasta,
  onRenamePasta,
  onDeletePasta,
  onReorderPastas,
  onConfiguracoes,
  onUpdateStatus,
  onUpdateErro,
  onHoverChange,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const naLixeira = location.pathname === '/trash';

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nomeEditando, setNomeEditando] = useState('');
  const [iconeEditando, setIconeEditando] = useState('folder');
  const [confirmandoDeleteId, setConfirmandoDeleteId] = useState<number | null>(null);
  const [versaoApp, setVersaoApp] = useState('');
  const [instalando, setInstalando] = useState(false);
  const [erroExpandido, setErroExpandido] = useState(false);
  const voltarIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recolhido, setRecolhido] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setVersaoApp);
  }, []);

  useEffect(() => {
    if (updateStatus === 'up-to-date') {
      voltarIdleRef.current = setTimeout(() => {
        onUpdateStatus('idle');
      }, 4000);
    }
    return () => {
      if (voltarIdleRef.current) clearTimeout(voltarIdleRef.current);
    };
  }, [updateStatus, onUpdateStatus]);

  function iniciarEdicao(pasta: Pasta) {
    setEditandoId(pasta.id);
    setNomeEditando(pasta.nome);
    setIconeEditando(pasta.icone ?? 'folder');
  }

  function confirmarRename(pasta: Pasta) {
    const nomeTrimado = nomeEditando.trim();
    if (nomeTrimado) {
      onRenamePasta(pasta.id, nomeTrimado, pasta.cor, iconeEditando);
    }
    setEditandoId(null);
    setNomeEditando('');
    setIconeEditando('folder');
  }

  function cancelarEdicao() {
    setEditandoId(null);
    setNomeEditando('');
    setIconeEditando('folder');
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pastas.findIndex((p) => p.id === active.id);
    const newIndex = pastas.findIndex((p) => p.id === over.id);
    const novaOrdem = arrayMove(pastas, oldIndex, newIndex).map((p) => p.id);
    onReorderPastas(novaOrdem);
  }

  async function handleCheck() {
    onUpdateErro('');
    setErroExpandido(false);
    onUpdateStatus('checking');
    await window.electronAPI.checkForUpdates();
  }

  async function handleInstall() {
    setInstalando(true);
    await window.electronAPI.installUpdate();
  }

  function handleBaixarManual() {
    window.electronAPI.copyToClipboard(RELEASE_URL);
  }

  function renderBotaoUpdate() {
    function icone() {
      if (updateStatus === 'checking') return '🔄';
      if (updateStatus === 'up-to-date') return '✅';
      if (updateStatus === 'available') return '⬇️';
      if (updateStatus === 'downloaded') return '✅';
      if (updateStatus === 'error') return '⚠️';
      return '🔄';
    }

    function texto() {
      if (updateStatus === 'checking') return 'Verificando...';
      if (updateStatus === 'up-to-date') return 'Tudo atualizado!';
      if (updateStatus === 'available') return 'Baixando...';
      if (updateStatus === 'downloaded') return 'Pronto para instalar';
      if (updateStatus === 'error') return 'Erro na atualização';
      return 'Buscar atualizações';
    }

    function corTexto() {
      if (updateStatus === 'up-to-date' || updateStatus === 'downloaded') return '#CFA6FF';
      if (updateStatus === 'error') return '#f87171';
      return '#5A3A8A';
    }

    if (updateStatus === 'downloaded') {
      return (
        <button
          type="button"
          onClick={handleInstall}
          disabled={instalando}
          className="w-full flex items-center py-2 rounded-lg text-sm transition-colors mx-1 disabled:opacity-50"
          style={{ color: '#CFA6FF' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E0A38';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          <span className="w-10 flex items-center justify-center shrink-0 text-base">✅</span>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-2">
            {instalando ? 'Instalando...' : 'Instalar agora'}
          </span>
        </button>
      );
    }

    if (updateStatus === 'error') {
      return (
        <div className="flex flex-col mx-1">
          <button
            type="button"
            onClick={() => setErroExpandido(!erroExpandido)}
            className="w-full flex items-center py-2 rounded-lg text-sm transition-colors"
            style={{ color: '#f87171' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E0A38';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            <span className="w-10 flex items-center justify-center shrink-0 text-base">⚠️</span>
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-2">
              Erro na atualização
            </span>
          </button>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-1 pl-10 pr-2 pb-1">
            {updateErro && (
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setErroExpandido(!erroExpandido)}
                  className="text-xs text-left transition-colors"
                  style={{ color: '#5A3A8A' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
                  }}
                >
                  {erroExpandido ? '▲ Ocultar' : '▼ Ver erro'}
                </button>
                {erroExpandido && (
                  <pre
                    className="text-xs font-mono rounded px-2 py-1 whitespace-pre-wrap break-all max-h-20 overflow-y-auto"
                    style={{
                      backgroundColor: '#0B0F1A',
                      color: '#f87171',
                      border: '1px solid #3B136B',
                    }}
                  >
                    {updateErro}
                  </pre>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={handleCheck}
              className="text-xs text-left transition-colors"
              style={{ color: '#5A3A8A' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
              }}
            >
              🔄 Tentar novamente
            </button>
            <button
              type="button"
              onClick={handleBaixarManual}
              className="text-xs text-left transition-colors"
              style={{ color: '#5A3A8A' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
              }}
            >
              📋 Copiar link para baixar
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateStatus('idle');
                setErroExpandido(false);
              }}
              className="text-xs text-left transition-colors"
              style={{ color: '#5A3A8A' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#5A3A8A';
              }}
            >
              ✕ Fechar
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={updateStatus === 'idle' || updateStatus === 'up-to-date' ? handleCheck : undefined}
        disabled={updateStatus === 'checking' || updateStatus === 'available'}
        className="w-full flex items-center py-2 rounded-lg text-sm transition-colors mx-1 disabled:opacity-60"
        style={{ color: corTexto() }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1E0A38';
          if (updateStatus === 'idle') {
            (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          (e.currentTarget as HTMLButtonElement).style.color = corTexto();
        }}
      >
        <span className="w-10 flex items-center justify-center shrink-0 text-base">{icone()}</span>
        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-2">
          {texto()}
        </span>
      </button>
    );
  }

  return (
    <aside
      className="group shrink-0 h-screen flex flex-col border-r transition-all duration-300 overflow-hidden"
      style={{
        backgroundColor: '#12082A',
        borderColor: '#3B136B',
        width: recolhido ? '3rem' : '13rem',
      }}
      onMouseEnter={() => {
        setRecolhido(false);
        onHoverChange(true);
      }}
      onMouseLeave={() => {
        setRecolhido(true);
        onHoverChange(false);
      }}
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
      <nav
        className="flex-1 py-2 flex flex-col gap-1 min-h-0 scrollbar-hidden"
        style={{ overflowY: 'auto', msOverflowStyle: 'none' }}
      >
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
          <span className="w-10 flex items-center justify-center shrink-0 text-base">🗂</span>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pr-2">
            Todas as contas
          </span>
        </button>

        {/* Pastas com drag and drop */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pastas.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {pastas.map((pasta) => (
              <PastaItem
                key={pasta.id}
                pasta={pasta}
                sidebarAberta={!recolhido}
                ativa={pastaAtiva === pasta.id && !naLixeira}
                editandoId={editandoId}
                nomeEditando={nomeEditando}
                iconeEditando={iconeEditando}
                corEditando={pasta.cor}
                confirmandoDeleteId={confirmandoDeleteId}
                onSelecionar={() => {
                  onSelecionarPasta(pasta.id);
                  navigate('/');
                }}
                onIniciarEdicao={() => iniciarEdicao(pasta)}
                onConfirmarRename={() => confirmarRename(pasta)}
                onCancelarEdicao={cancelarEdicao}
                onNomeChange={setNomeEditando}
                onIconeChange={setIconeEditando}
                onConfirmarDelete={() => {
                  onDeletePasta(pasta.id);
                  setConfirmandoDeleteId(null);
                }}
                onPedirDelete={() => setConfirmandoDeleteId(pasta.id)}
                onCancelarDelete={() => setConfirmandoDeleteId(null)}
              />
            ))}
          </SortableContext>
        </DndContext>
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

        {/* Atualização */}
        {renderBotaoUpdate()}

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
            <button
              type="button"
              onClick={() => window.electronAPI.openExternal('https://github.com/yannevic')}
              className="text-xs whitespace-nowrap text-left transition-colors"
              style={{ color: '#3B136B' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#CFA6FF';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#3B136B';
              }}
            >
              Made by Nana 🌸
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
