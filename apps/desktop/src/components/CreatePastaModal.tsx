import { useState } from 'react';

const CORES = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#64748b',
];

interface CreatePastaModalProps {
  onClose: () => void;
  onCreate: (nome: string, cor: string) => Promise<void>;
}

export default function CreatePastaModal({ onClose, onCreate }: CreatePastaModalProps) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(CORES[5]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!nome.trim()) return;
    setLoading(true);
    await onCreate(nome.trim(), cor);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h2 className="text-white text-lg font-semibold">Nova pasta</h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-400">Nome</label>
          <input
            className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-yellow-400"
            placeholder="Ex: Contas para vender"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400">Cor</label>
          <div className="flex gap-2 flex-wrap">
            {CORES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCor(c)}
                className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  outline: cor === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '3px',
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!nome.trim() || loading}
            className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-900 font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}
