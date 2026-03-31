import { useState } from 'react';
import { ELO_TIERS, UNRANKED } from '../lib/eloConfig';
import type { Pasta } from '../types/pasta';

interface BulkActionBarProps {
  count: number;
  pastas: Pasta[];
  selectedIds: number[];
  onDeleteSelected: () => void;
  onSetEloSelected: (elo: string) => void;
  onMoveTopastaSelected: (pastaId: number | null) => void;
  onClearSelection: () => void;
}

type AcaoAtiva = 'elo' | 'pasta' | null;

export default function BulkActionBar({
  count,
  pastas,
  selectedIds,
  onDeleteSelected,
  onSetEloSelected,
  onMoveTopastaSelected,
  onClearSelection,
}: BulkActionBarProps) {
  const [acaoAtiva, setAcaoAtiva] = useState<AcaoAtiva>(null);
  const [eloSelecionado, setEloSelecionado] = useState('');
  const [pastaSelecionada, setPastaSelecionada] = useState('');

  function handleSetElo() {
    if (!eloSelecionado) return;
    onSetEloSelected(eloSelecionado);
    setAcaoAtiva(null);
    setEloSelecionado('');
  }

  function handleMovePasta() {
    if (!pastaSelecionada) return;
    const pastaId = pastaSelecionada === 'none' ? null : Number(pastaSelecionada);
    onMoveTopastaSelected(pastaId);
    setAcaoAtiva(null);
    setPastaSelecionada('');
  }

  async function handleExportar() {
    await window.electronAPI.exportAccounts(selectedIds);
  }

  return (
    <div className="fixed bottom-0 left-52 right-0 bg-zinc-800 border-t border-zinc-700 px-6 py-3 flex items-center gap-3 flex-wrap z-40">
      <span className="text-sm text-zinc-300 font-medium shrink-0">
        {count} selecionada{count !== 1 ? 's' : ''}
      </span>

      {acaoAtiva === null && (
        <>
          <button
            type="button"
            onClick={() => setAcaoAtiva('elo')}
            className="text-sm bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-white transition-colors"
          >
            Definir elo
          </button>
          <button
            type="button"
            onClick={() => setAcaoAtiva('pasta')}
            className="text-sm bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-white transition-colors"
          >
            Mover para pasta
          </button>
          <button
            type="button"
            onClick={handleExportar}
            className="text-sm bg-zinc-700 hover:bg-zinc-600 px-3 py-1.5 rounded-lg text-white transition-colors"
          >
            ↓ Exportar
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            className="text-sm bg-red-800 hover:bg-red-700 px-3 py-1.5 rounded-lg text-white transition-colors"
          >
            Excluir selecionadas
          </button>
        </>
      )}

      {acaoAtiva === 'elo' && (
        <>
          <select
            className="bg-zinc-700 text-white text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
            value={eloSelecionado}
            onChange={(e) => setEloSelecionado(e.target.value)}
          >
            <option value="">Selecionar elo...</option>
            <option value={UNRANKED.nome}>{UNRANKED.nome}</option>
            {ELO_TIERS.map((t) => (
              <option key={t.nome} value={t.nome}>
                {t.nome}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSetElo}
            disabled={!eloSelecionado}
            className="text-sm bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-900 font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => setAcaoAtiva(null)}
            className="text-sm text-zinc-400 hover:text-white px-2 py-1.5 transition-colors"
          >
            Voltar
          </button>
        </>
      )}

      {acaoAtiva === 'pasta' && (
        <>
          <select
            className="bg-zinc-700 text-white text-sm px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400"
            value={pastaSelecionada}
            onChange={(e) => setPastaSelecionada(e.target.value)}
          >
            <option value="">Selecionar pasta...</option>
            <option value="none">Sem pasta</option>
            {pastas.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.nome}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleMovePasta}
            disabled={!pastaSelecionada}
            className="text-sm bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-zinc-900 font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Mover
          </button>
          <button
            type="button"
            onClick={() => setAcaoAtiva(null)}
            className="text-sm text-zinc-400 hover:text-white px-2 py-1.5 transition-colors"
          >
            Voltar
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onClearSelection}
        className="ml-auto text-sm text-zinc-500 hover:text-white transition-colors"
      >
        Cancelar seleção
      </button>
    </div>
  );
}
