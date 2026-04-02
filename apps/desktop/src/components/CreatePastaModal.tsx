import { useState } from 'react';
import { PASTA_ICONS } from '../lib/pastaIcons';

const CORES = [
  '#ef4444',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#ffd93d',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
  '#ff6b6b',
  '#ffffff',
  '#94a3b8',
  '#64748b',
  '#1e293b',
];

interface CreatePastaModalProps {
  onClose: () => void;
  onCreate: (nome: string, cor: string, icone: string) => Promise<void>;
}

export default function CreatePastaModal({ onClose, onCreate }: CreatePastaModalProps) {
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(CORES[5]);
  const [icone, setIcone] = useState('folder');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!nome.trim()) return;
    setLoading(true);
    await onCreate(nome.trim(), cor, icone);
    setLoading(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-void-900 border border-void-800 rounded-xl w-full max-w-sm p-6 flex flex-col gap-4 shadow-xl shadow-black/50">
        <h2 className="text-rift-200 text-lg font-semibold">Nova pasta</h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-rift-200/50">Nome</label>
          <input
            className="bg-void-950 border border-void-800 rounded-lg px-3 py-2 text-rift-200 text-sm outline-none focus:ring-2 focus:ring-rift-400 placeholder-rift-200/20 transition-colors"
            placeholder="Ex: Contas para vender"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-rift-200/50">Cor</label>
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

        <div className="flex flex-col gap-2">
          <label className="text-xs text-rift-200/50">Ícone</label>
          <div className="flex gap-2 flex-wrap">
            {PASTA_ICONS.map((ic) => (
              <button
                key={ic.id}
                type="button"
                onClick={() => setIcone(ic.id)}
                title={ic.label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{
                  backgroundColor: icone === ic.id ? cor + '33' : 'transparent',
                  border: icone === ic.id ? `1.5px solid ${cor}` : '1.5px solid transparent',
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: icone === ic.id ? cor : '#5A3A8A' }}
                  dangerouslySetInnerHTML={{ __html: ic.svg }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-rift-200/40 hover:text-rift-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!nome.trim() || loading}
            className="px-5 py-2 bg-rift-500 hover:bg-rift-400 disabled:opacity-40 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Criando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}
