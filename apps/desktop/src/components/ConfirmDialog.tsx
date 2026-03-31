interface Props {
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmDialog({ mensagem, onConfirmar, onCancelar }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-6">
        <p className="text-white text-sm">{mensagem}</p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-sm font-semibold"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
