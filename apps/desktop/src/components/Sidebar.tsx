import { useNavigate } from 'react-router-dom';
import type { Pasta } from '../types/pasta';

interface SidebarProps {
  pastas: Pasta[];
  pastaAtiva: number | null;
  onSelecionarPasta: (id: number | null) => void;
  onNovaPasta: () => void;
}

export default function Sidebar({
  pastas,
  pastaAtiva,
  onSelecionarPasta,
  onNovaPasta,
}: SidebarProps) {
  const navigate = useNavigate();

  return (
    <aside className="group w-12 hover:w-52 shrink-0 bg-zinc-950 h-screen flex flex-col border-r border-zinc-800 transition-all duration-300 overflow-hidden">
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-zinc-800 shrink-0">
        <span className="text-yellow-400 text-xl shrink-0">✦</span>
        <span className="ml-3 text-yellow-400 font-bold text-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          LoL Accounts
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-hidden p-2 flex flex-col gap-1">
        {/* Todas as contas */}
        <button
          type="button"
          onClick={() => onSelecionarPasta(null)}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            pastaAtiva === null
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <span className="text-base shrink-0">🗂</span>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Todas as contas
          </span>
        </button>

        {/* Pastas */}
        {pastas.map((pasta) => (
          <button
            key={pasta.id}
            type="button"
            onClick={() => onSelecionarPasta(pasta.id)}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
              pastaAtiva === pasta.id
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: pasta.cor }}
            />
            <span className="truncate whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {pasta.nome}
            </span>
          </button>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="p-2 flex flex-col gap-1 border-t border-zinc-800 shrink-0">
        <button
          type="button"
          onClick={onNovaPasta}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <span className="text-base shrink-0">＋</span>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Nova pasta
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/trash')}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <span className="text-base shrink-0">🗑</span>
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Lixeira
          </span>
        </button>
      </div>
    </aside>
  );
}
