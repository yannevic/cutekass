interface Props {
  versao: string;
  onFechar: () => void;
}

const CHANGELOG: Record<string, string[]> = {
  '1.0.13': [
    '🌸 CuteKass v1.0.11  *  🔧 Correção do bug',
  ],

  '1.0.12': [
    '🌸 CuteKass v1.0.11  *  🔧 Correção do bug',
  ],

  '1.0.11': [
    '🌸 CuteKass v1.0.11  *  🔧 Correção do bug',
  ],

  '1.0.9': [
    '🔄 Botão de atualização movido para a sidebar — agora fica no rodapé ao lado das configurações',
  ],
  '1.0.8': [
    '🔧 Correção do sistema de atualizações automáticas — notificação agora aparece corretamente ao abrir o app',
    '🔄 Botão para buscar atualizações manualmente',
  ],
  '1.0.7': [
    '🔧 Correção do sistema de atualizações automáticas — notificação agora aparece corretamente ao abrir o app',
  ],
  '1.0.6': [
    '💾 Histórico de backup nas configurações — veja e copie as últimas 3 sessões salvas automaticamente',
  ],
  '1.0.5': ['🔧 Correção do sistema de atualizações automáticas'],
  '1.0.4': ['🔀 Reordenação de contas por arrastar e soltar'],
  '1.0.3': [
    '🔧 Correção do sistema de atualizações automáticas',
    '📋 Changelog — novidades ao abrir uma nova versão',
    '🏷️ Versão exibida na sidebar',
  ],
  '1.0.2': ['✨ Atualizações automáticas — o app avisa quando tem novidade e instala sozinho'],
  '1.0.1': [
    '🎉 Primeira versão pública do CuteKass',
    '📁 Pastas para organizar contas',
    '🔍 Busca e filtros por elo',
    '⚡ Login automático no Riot Client',
    '📋 Importar contas do bloco de notas',
  ],
};

export default function ChangelogModal({ versao, onFechar }: Props) {
  const novidades = CHANGELOG[versao] ?? ['Melhorias gerais e correções.'];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div
        className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
        style={{ backgroundColor: '#1E0A38', border: '1px solid #3B136B' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: '#CFA6FF' }}>
            🌸 CuteKass {versao}
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#3B136B', color: '#D94BFF' }}
          >
            novidades
          </span>
        </div>

        <ul className="flex flex-col gap-2">
          {novidades.map((item) => (
            <li key={item} className="text-sm" style={{ color: '#CFA6FF' }}>
              {item}
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center mt-2">
          <span className="text-xs" style={{ color: '#5A3A8A' }}>
            Made by Nana 🌸
          </span>
          <button
            type="button"
            onClick={onFechar}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#7B2CF5', color: '#fff' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#A23CFF';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7B2CF5';
            }}
          >
            Entendido!
          </button>
        </div>
      </div>
    </div>
  );
}
