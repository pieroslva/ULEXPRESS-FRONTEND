import { useEffect, useState } from "react";
import { api } from "../../config/api";
import IncidenciaModal from "../../components/IncidenciaModal"; 


type Pedido = {
  id: string;
  fecha: string;
  estado: string;
  items: { 
    producto: { nombre: string; precio: number; imagen?: string }; 
    cantidad: number 
  }[];
  subtotal: number;
  delivery: number;
  total: number;
};

const s = (n:number)=> new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN"}).format(Number(n));

export default function Historial(){
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportandoId, setReportandoId] = useState<string | null>(null);

  useEffect(() => {
    api.get("/pedidos")
      .then(({ data }) => setPedidos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if(loading) return <div className="text-white/50">Cargando historial...</div>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Historial de pedidos</h1>

      {pedidos.length === 0 ? (
        <p className="text-gray-400">No tienes pedidos registrados en la base de datos.</p>
      ) : (
        <div className="grid gap-4">
          {pedidos.map(p => (
            <div key={p.id} className="border border-white/10 rounded-xl p-4 bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                <div>
                  <h3 className="font-semibold text-orange-400">Pedido #{String(p.id).padStart(8,'0')}</h3>
                  <p className="text-sm text-gray-400">{new Date(p.fecha).toLocaleString("es-PE")}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded font-bold ${
                  p.estado === 'ENTREGADO' ? 'bg-green-500/20 text-green-400' : 
                  p.estado === 'ACEPTADO' ? 'bg-blue-500/20 text-blue-400' : 
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {p.estado}
                </span>
              </div>

              <div className="space-y-2">
                {p.items.map((it, idx)=>(
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      {it.producto?.imagen && (
                        <img src={it.producto.imagen} className="h-8 w-8 object-cover rounded" />
                      )}
                      <span>{it.producto?.nombre} <span className="text-white/50">x{it.cantidad}</span></span>
                    </div>
                    <div className="text-white/70">
                      {s(Number(it.producto?.precio || 0) * it.cantidad)}
                    </div>
                  </div>
                ))}
              </div>
                <div className="mt-3 pt-3 border-t border-white/10 text-sm space-y-1">
                  <div className="flex justify-between font-bold text-lg mt-2 items-center">
                    <div className="flex gap-2 items-center">
                      <span>Total: {s(p.total)}</span>
                    </div>
                  
                  {/* BOTÓN DE REPORTE (Solo si ya fue aceptado o entregado) */}
                  {p.estado !== 'CREADO' && (
                    <button 
                      onClick={() => setReportandoId(p.id)}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs transition-colors"
                    >
                      ⚠️ Reportar Problema
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Renderizado del Modal */}
      {reportandoId && (
        <IncidenciaModal 
          pedidoId={reportandoId} 
          onClose={() => setReportandoId(null)} 
        />
      )}
    </section>
  );
}