interface Props {
  versao: string;
  onFechar: () => void;
}

const CHANGELOG: Record<string, string[]> = {
  '1.0.43': [
    '✨ Layout reformulado em duas colunas (stats à esquerda, skins à direita) com melhorias adicionais',
  ],

  '1.0.42': [
    '✨ Gerar colagem de skins: cria pasta com splash arts da conta em Downloads!',
  ],

  '1.0.41': [
    '✨ Gerar colagem de skins: cria pasta com splash arts da conta em Downloads',
  ],

  '1.0.40': [
    '✨ Lista de skins da conta no modal LCU, com busca por nome',
  ],

  '1.0.39': [
    '✨ Dados do cliente salvos no card da conta',
    '✨ Ícone no card mostra data da última avaliação',
    '✨ Botão de vincular some se nick já está vinculado',
  ],

  '1.0.38': [
    '✨ Correção no cálculo de jogos do simulador',
    '✨ Correção ao editar cor das pastas na sidebar',
  ],

  '1.0.37': [
    '✨ Edição de cor das pastas na sidebar',
    '✨ Cor do WR muda por faixa✨ Simule quantos jogos faltam para subir de elo',
    '✨ Calcule em quantos dias você chega no objetivo pelo seu ritmo de jogo',
    '✨ Edição de cor das pastas na sidebar',
    '✨ Cor do WR muda por faixa: azul 100%, dourado 80~99%, roxo 70~79%, cinza abaixo de 70%',
  ],

  '1.0.36': [
    '✨ Ícones personalizáveis nas pastas',
    '✨ Mais cores disponíveis para pastas',
    '✨ Reordene pastas arrastando e soltando',
    '✨ Wins, losses e winrate nas contas',
    '✨ Stats atualizados junto com o elo',
  ],

  '1.0.35': [
    '✨ Pastas agora têm ícones personalizáveis',
    '✨ Escolha o ícone ao criar ou editar uma pasta',
    '✨ Reordene pastas arrastando e soltando',
    '✨ Handle de drag some quando a sidebar está fechada',
  ],

  '1.0.34': [
    '✨ Links externos abrem no navegador do sistema',
    '✨ Selects customizados com estilo, posição e direção',
    '✨ Scrollbar customizada nos selects',
    '✨ Import aceita mais formatos de texto',
    '✨ Área clicável do drag handle aumentada',
    '✨ Checkbox dos cards customizado',
    '✨ BulkActionBar ocupa toda a largura da tela',
  ],

  '1.0.33': [
    '✨ Atualização de elos em lote sem travar a tela',
    '✨ Progresso visível ao atualizar elos',
    '✨ Atualizar elos só das contas selecionadas',
    '✨ Login no Riot Client limpa os campos antes de digitar',
    '✨ Exportar contas inclui nick e abre a pasta automaticamente',
    '✨ Fonte Space Grotesk',
    '✨ Validação de nick duplicado ao salvar conta',
    '✨ Filtro por contas sem nick',
    '✨ Scroll nas pastas da sidebar',
    '✨ Import aceita mais formatos de texto',
    '✨ Links externos abrem no navegador do sistema',
  ],

  '1.0.32': [
    '✨ Link do GitHub ao clicar em "Made by Nana" da sidebar 💕',
  ],

  '1.0.31': [
    '✨ Disponível agora avaliação de conta contendo nick, nível, campeões, essências, skins',
  ],

  '1.0.30': [
    '✨ Disponível agora avaliação de conta contendo nível, campeões, essências, skins',
  ],

  '1.0.29': [
    '🌸 CuteKass v1.0.29',
    '✨ Release automática.',
  ],

  '1.0.28': [
    '🌸 CuteKass v1.0.28',
    '✨ Menu nativo do Electron removido',
    '✨ Verificação automática de atualizações a cada hora',
  ],

  '1.0.27': [
    '🌸 CuteKass v1.0.25',
    '✨ Scroll ping-pong no nome de pastas longas',
    '✨ Filtro "Sem pasta" na barra de busca',
  ],
  '1.0.26': [
    '🌸 CuteKass v1.0.25',
    '✨ Scroll ping-pong no nome de pastas longas',
    '✨ Filtro "Sem pasta" na barra de busca',
  ],

  '1.0.25': ['🌸 CuteKass v1.0.25  *  🔧 Correção de bugs'],

  '1.0.23': ['🌸 CuteKass v1.0.22  *  🔧 Correção de bugs'],

  '1.0.22': ['🌸 CuteKass v1.0.22  *  🔧 Correção de bugs'],

  '1.0.21': ['🌸 CuteKass v1.0.21  *  🔧 Correção de bugs'],

  '1.0.20': ['🌸 CuteKass v1.0.19  *  🔧 Correção de bugs'],

  '1.0.19': ['🌸 CuteKass v1.0.18  *  🔧 Correção de bugs'],

  '1.0.18': ['🌸 CuteKass v1.0.11  *  🔧 Correção do bug'],

  '1.0.17': ['🌸 CuteKass v1.0.11  *  🔧 Correção do bug'],

  '1.0.16': ['🌸 CuteKass v1.0.11  *  🔧 Correção do bug'],

  '1.0.15': ['🌸 CuteKass v1.0.11  *  🔧 Correção do bug'],

  '1.0.14': ['🌸 CuteKass v1.0.11  *  🔧 Correção do bug'],

  '1.0.13': ['🌸 CuteKass v1.0.11  *  🔧 Correção do bug'],

  '1.0.12': ['🌸 CuteKass v1.0.11  *  🔧 Correção do bug'],

  '1.0.11': ['🌸 CuteKass v1.0.11  *  🔧 Correção do bug'],

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
