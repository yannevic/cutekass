interface LcuDados {
  nivel: number;
  essenciaAzul: number;
  essenciaLaranja: number;
  numCampeoes: number;
  numSkins: number;
}

interface LcuModalProps {
  nick: string;
  dados: LcuDados | null;
  erro: string;
  carregando: boolean;
  onFechar: () => void;
}

export default function LcuModal({ nick, dados, erro, carregando, onFechar }: LcuModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-void-900 border border-void-800 rounded-2xl p-6 w-80 shadow-2xl shadow-black/60 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-rift-200 text-base">🔍 {nick}</h2>
          <button
            type="button"
            onClick={onFechar}
            className="text-rift-200/40 hover:text-rift-200 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {carregando && (
          <p className="text-rift-200/50 text-sm text-center py-4">Lendo cliente...</p>
        )}

        {erro && !carregando && <p className="text-red-400 text-sm text-center">{erro}</p>}

        {dados && !carregando && (
          <ul className="flex flex-col gap-3">
            {[
              { icone: '🎮', label: 'Nível', valor: dados.nivel },
              { icone: '🏆', label: 'Campeões', valor: dados.numCampeoes },
              {
                icone: '💙',
                label: 'Essência Azul',
                valor: dados.essenciaAzul.toLocaleString('pt-BR'),
              },
              {
                icone: '🧡',
                label: 'Essência Laranja',
                valor: dados.essenciaLaranja.toLocaleString('pt-BR'),
              },
              { icone: '✨', label: 'Skins', valor: dados.numSkins },
            ].map(({ icone, label, valor }) => (
              <li
                key={label}
                className="flex items-center justify-between bg-void-800/60 rounded-xl px-4 py-2.5"
              >
                <span className="text-sm text-rift-200/70">
                  {icone} {label}
                </span>
                <span className="font-bold text-rift-200">{valor}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={onFechar}
          className="mt-1 text-sm text-rift-200/40 hover:text-rift-200 transition-colors text-center"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
