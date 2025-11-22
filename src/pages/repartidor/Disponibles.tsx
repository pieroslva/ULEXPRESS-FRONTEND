import { useEffect, useState } from "react";
import { api } from "../../config/api";

type PedidoDisponible = {
  id: string;
  fecha: string;
  total: number;
  metodoPago: string;
  tienda: string;
  ubicacionTienda: string;
  cliente: string;
};

const s = (n: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(Number(n));

export default function Disponibles() {
  const [pedidos, setPedidos] = useState<PedidoDisponible[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = () => {
    setLoading(true);
    api.get("/repartidor/pedidos/disponibles")
      .then(({ data }) => setPedidos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const aceptar = async (id: string) => {
    try {
      await api.patch(`/repartidor/pedidos/${id}/aceptar`);
      alert("¡Pedido aceptado!");
      cargar(); // Recargar la lista para que desaparezca el aceptado
    } catch (e) {
      console.error(e);
      alert("Error al aceptar (quizás ya lo tomó otro).");
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex justify-between">
        <h1 className="text-2xl font-bold">Disponibles</h1>
        <button onClick={cargar} className="text-blue-400 underline">Refrescar</button>
      </header>

      {loading ? <p>Cargando...</p> : pedidos.length === 0 ? (
        <p className="text-gray-400">No hay pedidos pendientes.</p>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p) => (
            <div key={p.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex justify-between font-bold mb-2">
                <span className="text-blue-300">#{String(p.id).padStart(8,'0')}</span>
                <span>{s(p.total)}</span>
              </div>
              <div className="text-sm text-gray-300 mb-3 space-y-1">
                <p>🏠 {p.tienda} ({p.ubicacionTienda})</p>
                <p>👤 Cliente: {p.cliente}</p>
                <p>💰 Pago: <span className="uppercase text-white">{p.metodoPago}</span></p>
              </div>
              <button onClick={() => aceptar(p.id)} className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold transition">
                Aceptar Entrega
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
