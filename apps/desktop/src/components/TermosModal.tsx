interface TermosModalProps {
  onAceitar: () => void;
}

export default function TermosModal({ onAceitar }: TermosModalProps) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80">
      <div className="bg-void-900 border border-void-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌸</span>
          <h2 className="text-lg font-bold text-rift-200">Bem-vindo(a) ao CuteKass</h2>
        </div>

        <div
          className="overflow-y-auto flex flex-col gap-4 text-sm text-rift-200/70 leading-relaxed pr-1 scrollbar-custom"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#5a1fa8 transparent' }}
        >
          <p className="text-rift-200/90">
            Antes de começar, leia com atenção como o CuteKass funciona e como seus dados são
            tratados.
          </p>

          <div className="flex flex-col gap-1">
            <p className="text-rift-200 font-semibold">📦 O que o app armazena</p>
            <p>
              O CuteKass armazena localmente no seu computador os logins, senhas, nicks e
              informações das suas contas de League of Legends. Nenhum dado é enviado para
              servidores externos — tudo fica apenas no seu PC.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-rift-200 font-semibold">🔒 Segurança</p>
            <p>
              Os dados são armazenados em um banco de dados criptografado. Ainda assim, você é
              responsável pela segurança do seu computador. Não compartilhe o app nem seus arquivos
              de dados com outras pessoas.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-rift-200 font-semibold">⚠️ Responsabilidade</p>
            <p>
              O CuteKass é uma ferramenta de organização pessoal. O uso do app é de sua inteira
              responsabilidade. A desenvolvedora não se responsabiliza por perda de acesso a contas,
              banimentos ou qualquer dano decorrente do uso do app.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-rift-200 font-semibold">🎮 Sobre a Riot Games</p>
            <p>
              O CuteKass não é afiliado à Riot Games. League of Legends é marca registrada da Riot
              Games. O app utiliza a API pública da Riot apenas para buscar informações de elo.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-rift-200 font-semibold">💛 Apoie o projeto</p>
            <p>
              O CuteKass é gratuito. Se quiser apoiar o desenvolvimento, considere deixar um café:
            </p>
            <button
              type="button"
              onClick={() => window.electronAPI.openExternal('https://ko-fi.com/nanafofa')}
              className="self-start text-rift-300 hover:text-rift-200 underline underline-offset-2 transition-colors"
            >
              ☕ ko-fi.com/nanafofa
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-rift-200 font-semibold">📬 Contato</p>
            <p>
              Dúvidas ou sugestões:{' '}
              <button
                type="button"
                onClick={() => window.electronAPI.openExternal('mailto:devnanalol@gmail.com')}
                className="text-rift-300 hover:text-rift-200 underline underline-offset-2 transition-colors"
              >
                devnanalol@gmail.com
              </button>
            </p>
          </div>
        </div>

        <div className="border-t border-void-800 pt-4 flex flex-col gap-3">
          <p className="text-xs text-rift-200/40">
            Ao clicar em &ldquo;Li e aceito&rdquo;, você confirma que leu e concorda com os termos
            acima.
          </p>
          <button
            type="button"
            onClick={onAceitar}
            className="w-full bg-rift-500 hover:bg-rift-400 text-white font-bold py-2.5 rounded-xl transition-colors"
          >
            🌸 Li e aceito
          </button>
        </div>
      </div>
    </div>
  );
}
