import { useState, useMemo } from 'react';
import { parseAccountsText, ParsedAccount } from '../lib/parser';

interface ImportModalProps {
  onClose: () => void;
  onImport: (accounts: ParsedAccount[]) => Promise<void>;
}

export default function ImportModal({ onClose, onImport }: ImportModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const parsed = useMemo(() => {
    if (!text.trim()) return [];
    return parseAccountsText(text);
  }, [text]);

  async function handleImport() {
    if (parsed.length === 0) return;
    setLoading(true);
    setError('');
    try {
      await onImport(parsed);
      onClose();
    } catch {
      setError('Erro ao importar contas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-void-900 border border-void-800 rounded-xl w-full max-w-lg p-6 flex flex-col gap-4 shadow-xl shadow-black/50">
        <h2 className="text-rift-200 text-lg font-semibold">Importar do Bloco de Notas</h2>

        <p className="text-rift-200/50 text-sm">
          Cole o conteúdo abaixo. Formatos aceitos por conta:
          <br />
          <span className="text-rift-200/80 font-mono">login:senha</span> ou{' '}
          <span className="text-rift-200/80 font-mono">login:senha nick#TAG</span> — uma por linha,
          sem espaço entre elas.
          <br />
          Ou em linhas separadas: <span className="text-rift-200/80 font-mono">login</span> /{' '}
          <span className="text-rift-200/80 font-mono">senha</span> /{' '}
          <span className="text-rift-200/80 font-mono">nick#TAG</span> (opcional) — nesse caso
          separe cada conta com uma linha em branco.
        </p>

        <textarea
          className="w-full h-40 bg-void-950 border border-void-800 rounded-lg p-3 text-rift-200 font-mono text-sm resize-none focus:outline-none focus:border-rift-400 transition-colors"
          placeholder={'conta1:senha1\nconta2:senha2 Nick2#BR1\n\nconta3\nsenha3\nNick3#BR1'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {parsed.length > 0 && (
          <div className="bg-void-950 border border-void-800 rounded-lg p-3 max-h-40 overflow-y-auto flex flex-col gap-1">
            <p className="text-rift-200/40 text-xs mb-1">
              {parsed.length} conta{parsed.length !== 1 ? 's' : ''} encontrada
              {parsed.length !== 1 ? 's' : ''}:
            </p>
            {parsed.map((acc) => (
              <div
                key={`${acc.login}-${acc.senha}`}
                className="flex gap-2 text-sm font-mono flex-wrap"
              >
                <span className="text-rift-400">{acc.login}</span>
                <span className="text-rift-200/30">·</span>
                <span className="text-rift-200/40">
                  {'•'.repeat(Math.min(acc.senha.length, 8))}
                </span>
                {acc.nick && (
                  <>
                    <span className="text-rift-200/30">·</span>
                    <span className="text-rift-300">{acc.nick}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {text.trim() !== '' && parsed.length === 0 && (
          <p className="text-rift-300/80 text-sm">
            Nenhuma conta reconhecida. Verifique o formato.
          </p>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-rift-200/50 hover:text-rift-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={parsed.length === 0 || loading}
            className="px-5 py-2 bg-rift-500 hover:bg-rift-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {loading
              ? 'Importando...'
              : `Importar ${parsed.length > 0 ? `(${parsed.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
