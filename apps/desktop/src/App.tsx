import { useState } from 'react';
import Home from './pages/Home';
import Trash from './pages/Trash';

type Pagina = 'home' | 'trash';

export default function App() {
  const [pagina, setPagina] = useState<Pagina>('home');

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      <nav className="flex gap-4 px-6 py-3 border-b border-zinc-800">
        <button
          type="button"
          onClick={() => setPagina('home')}
          className={`text-sm font-semibold ${pagina === 'home' ? 'text-yellow-400' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Contas
        </button>
        <button
          type="button"
          onClick={() => setPagina('trash')}
          className={`text-sm font-semibold ${pagina === 'trash' ? 'text-yellow-400' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Lixeira
        </button>
      </nav>

      {pagina === 'home' ? <Home /> : <Trash />}
    </div>
  );
}
