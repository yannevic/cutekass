interface Props {
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmDialog({ mensagem, onConfirmar, onCancelar }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-void-900 border border-void-800 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-6 shadow-xl shadow-black/50">
        <p className="text-rift-200 text-sm">{mensagem}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-lg bg-void-800 hover:bg-void-700 text-sm text-rift-200/70 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2 rounded-lg bg-red-900/70 hover:bg-red-800 border border-red-700/50 text-sm font-semibold text-red-300 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
