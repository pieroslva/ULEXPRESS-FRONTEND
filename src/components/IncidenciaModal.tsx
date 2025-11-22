import { useState } from "react";
import { reportarIncidencia } from "../services/PedidoService";

interface Props {
  pedidoId: string | number;
  onClose: () => void;
}

export default function IncidenciaModal({ pedidoId, onClose }: Props) {
  const [tipo, setTipo] = useState("Pedido incompleto");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return alert("Por favor describe el problema");

    setLoading(true);
    try {
      await reportarIncidencia(pedidoId, tipo, desc);
      alert("¡Reporte enviado! Revisaremos tu caso.");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al enviar el reporte. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-red-600/90 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">Reportar Incidencia</h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tipo de problema</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              <option>Pedido incompleto</option>
              <option>Comida en mal estado</option>
              <option>Nunca llegó</option>
              <option>Cobro incorrecto</option>
              <option>Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Descripción</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Cuéntanos qué pasó con tu pedido..."
              className="w-full bg-zinc-800 border border-white/10 rounded px-3 py-2 text-white h-24 resize-none focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-gray-300 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Reporte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}