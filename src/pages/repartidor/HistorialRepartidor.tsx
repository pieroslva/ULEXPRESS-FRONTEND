import { useEffect, useState } from "react";
import { api } from "../../config/api";

const s = (n: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(Number(n));

export default function HistorialRepartidor() {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // GET /api/pedidos devuelve todo lo asociado al repartidor
    api.get("/pedidos")
      .then(({ data }) => {
        // Filtramos solo los terminados
        const entregados = data.filter((p: any) => p.estado === 'ENTREGADO');
        setHistorial(entregados);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Historial de entregas</h1>
      
      {loading ? <p>Cargando...</p> : historial.length === 0 ? (
        <p className="text-gray-400">Aún no has completado ninguna entrega.</p>
      ) : (
        <div className="space-y-3">
          {historial.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 border border-white/10 opacity-75 hover:opacity-100 transition">
              <div>
                <div className="font-bold">#{String(p.id).padStart(8,'0')}</div>
                <div className="text-xs text-gray-400">
                  {new Date(p.fecha).toLocaleDateString()} - {new Date(p.fecha).toLocaleTimeString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-400">{s(p.total)}</div>
                <div className="text-xs text-gray-400">Ganancia aprox: {s(5.00)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}