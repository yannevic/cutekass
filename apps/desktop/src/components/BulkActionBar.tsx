import { useState } from 'react';
import { ELO_TIERS, UNRANKED } from '../lib/eloConfig';
import type { Pasta } from '../types/pasta';
import Select from './Select';
import { corDoElo } from '../lib/eloConfig';

interface BulkActionBarProps {
  count: number;
  pastas: Pasta[];
  selectedIds: number[];
  onDeleteSelected: () => void;
  onSetEloSelected: (elo: string) => void;
  onMoveTopastaSelected: (pastaId: number | null) => void;
  onClearSelection: () => void;
  onAtualizarEloSelected: () => void;
  hidden?: boolean;
  leftOffset: number;
}

type AcaoAtiva = 'elo' | 'pasta' | null;

export default function BulkActionBar({
  count,
  pastas,
  selectedIds,
  leftOffset,
  hidden,
  onDeleteSelected,
  onSetEloSelected,
  onMoveTopastaSelected,
  onClearSelection,
  onAtualizarEloSelected,
}: BulkActionBarProps) {
  const [acaoAtiva, setAcaoAtiva] = useState<AcaoAtiva>(null);
  const [eloSelecionado, setEloSelecionado] = useState('');
  const [pastaSelecionada, setPastaSelecionada] = useState('');
  const [exportado, setExportado] = useState(false);

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
    const fileName = await window.electronAPI.exportAccounts(selectedIds);
    if (fileName) {
      setExportado(true);
      setTimeout(() => setExportado(false), 2000);
    }
  }

  return (
    <div
      className={`fixed bottom-0 right-0 transition-all duration-300 bg-void-900 border-t border-void-800 px-6 py-3 flex items-center gap-3 flex-wrap z-40 ${
        hidden ? 'hidden' : 'opacity-100'
      }`}
      style={{ left: leftOffset }}
    >
      <span className="text-sm text-rift-200/70 font-medium shrink-0">
        {count} selecionada{count !== 1 ? 's' : ''}
      </span>

      {acaoAtiva === null && (
        <>
          <button
            type="button"
            onClick={onAtualizarEloSelected}
            className="text-sm bg-void-800 hover:bg-void-700 px-3 py-1.5 rounded-lg text-rift-200 transition-colors"
          >
            ⟳ Atualizar elos
          </button>
          <button
            type="button"
            onClick={() => setAcaoAtiva('elo')}
            className="text-sm bg-void-800 hover:bg-void-700 px-3 py-1.5 rounded-lg text-rift-200 transition-colors"
          >
            Definir elo
          </button>
          <button
            type="button"
            onClick={() => setAcaoAtiva('pasta')}
            className="text-sm bg-void-800 hover:bg-void-700 px-3 py-1.5 rounded-lg text-rift-200 transition-colors"
          >
            Mover para pasta
          </button>
          <button
            type="button"
            onClick={handleExportar}
            className="text-sm bg-void-800 hover:bg-void-700 px-3 py-1.5 rounded-lg text-rift-200 transition-colors"
          >
            {exportado ? '✓ Exportado!' : '↓ Exportar'}
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            className="text-sm bg-red-900/50 hover:bg-red-800/70 border border-red-800/50 px-3 py-1.5 rounded-lg text-red-400 transition-colors"
          >
            Excluir selecionadas
          </button>
        </>
      )}

      {acaoAtiva === 'elo' && (
        <>
          <Select
            value={eloSelecionado}
            onChange={setEloSelecionado}
            placeholder="Selecionar elo..."
            options={[
              { value: UNRANKED.nome, label: UNRANKED.nome },
              ...ELO_TIERS.map((t) => ({ value: t.nome, label: t.nome, color: corDoElo(t.nome) })),
            ]}
          />
          <button
            type="button"
            onClick={handleSetElo}
            disabled={!eloSelecionado}
            className="text-sm bg-rift-500 hover:bg-rift-400 disabled:opacity-40 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => setAcaoAtiva(null)}
            className="text-sm text-rift-200/40 hover:text-rift-200 px-2 py-1.5 transition-colors"
          >
            Voltar
          </button>
        </>
      )}

      {acaoAtiva === 'pasta' && (
        <>
          <Select
            value={pastaSelecionada}
            onChange={setPastaSelecionada}
            placeholder="Selecionar pasta..."
            options={[
              { value: 'none', label: 'Sem pasta' },
              ...pastas.map((p) => ({ value: String(p.id), label: p.nome, color: p.cor })),
            ]}
          />
          <button
            type="button"
            onClick={handleMovePasta}
            disabled={!pastaSelecionada}
            className="text-sm bg-rift-500 hover:bg-rift-400 disabled:opacity-40 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Mover
          </button>
          <button
            type="button"
            onClick={() => setAcaoAtiva(null)}
            className="text-sm text-rift-200/40 hover:text-rift-200 px-2 py-1.5 transition-colors"
          >
            Voltar
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onClearSelection}
        className="ml-auto text-sm text-rift-200/30 hover:text-rift-200 transition-colors"
      >
        Cancelar seleção
      </button>
    </div>
  );
}
