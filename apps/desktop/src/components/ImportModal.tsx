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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg p-6 flex flex-col gap-4">
        <h2 className="text-white text-lg font-semibold">Importar do Bloco de Notas</h2>

        <p className="text-zinc-400 text-sm">
          Cole o conteúdo abaixo. Formatos aceitos por conta:
          <br />
          <span className="text-zinc-300 font-mono">login:senha</span> ou{' '}
          <span className="text-zinc-300 font-mono">login</span> e{' '}
          <span className="text-zinc-300 font-mono">senha</span> em linhas separadas.
          <br />
          Opcionalmente, adicione o nick na linha seguinte:{' '}
          <span className="text-zinc-300 font-mono">Nome#TAG</span>.
          <br />
          Separe cada conta com uma linha em branco.
        </p>

        <textarea
          className="w-full h-40 bg-zinc-800 border border-zinc-600 rounded-lg p-3 text-zinc-100 font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
          placeholder={'conta1\nsenha1\nNick#BR1\n\nconta2:senha2\nNick2#BR1'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {parsed.length > 0 && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 max-h-40 overflow-y-auto flex flex-col gap-1">
            <p className="text-zinc-400 text-xs mb-1">
              {parsed.length} conta{parsed.length !== 1 ? 's' : ''} encontrada
              {parsed.length !== 1 ? 's' : ''}:
            </p>
            {parsed.map((acc) => (
              <div
                key={`${acc.login}-${acc.senha}`}
                className="flex gap-2 text-sm font-mono flex-wrap"
              >
                <span className="text-blue-400">{acc.login}</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-400">{'•'.repeat(Math.min(acc.senha.length, 8))}</span>
                {acc.nick && (
                  <>
                    <span className="text-zinc-500">·</span>
                    <span className="text-yellow-400">{acc.nick}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {text.trim() !== '' && parsed.length === 0 && (
          <p className="text-yellow-400 text-sm">Nenhuma conta reconhecida. Verifique o formato.</p>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

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
            onClick={handleImport}
            disabled={parsed.length === 0 || loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
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
