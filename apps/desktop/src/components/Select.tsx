import { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export default function Select({ value, onChange, options, placeholder }: SelectProps) {
  const [aberto, setAberto] = useState(false);
  const [abrePraCima, setAbrePraCima] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selecionada = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  function handleAbrir() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const espacoAbaixo = window.innerHeight - rect.bottom;
    setAbrePraCima(espacoAbaixo < 220);
    setAberto((v) => !v);
  }

  function handleSelecionar(opcao: SelectOption) {
    onChange(opcao.value);
    setAberto(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleAbrir}
        className="flex items-center gap-2 bg-void-900 border border-void-800 hover:border-void-700 rounded-lg px-3 py-2 text-sm transition-colors outline-none focus:ring-2 focus:ring-rift-400 whitespace-nowrap"
        style={{ color: selecionada?.color ?? '#CFA6FF' }}
      >
        <span className="flex-1 text-left">
          {selecionada?.label ?? placeholder ?? 'Selecionar...'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3 h-3 shrink-0 transition-transform text-rift-200/40 ${aberto ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {aberto && (
        <ul
          className="absolute left-0 right-0 z-50 bg-void-900 border border-void-800 rounded-lg shadow-lg shadow-black/50 overflow-y-auto max-h-52 scrollbar-custom"
          style={{
            ...(abrePraCima
              ? { bottom: '100%', marginBottom: '4px' }
              : { top: '100%', marginTop: '4px' }),
            msOverflowStyle: 'none',
          }}
        >
          {options.map((opcao) => (
            <li key={opcao.value}>
              <button
                type="button"
                onMouseDown={() => handleSelecionar(opcao)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-void-800 ${
                  opcao.value === value ? 'bg-void-800' : ''
                }`}
                style={{ color: opcao.color ?? '#CFA6FF' }}
              >
                {opcao.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
