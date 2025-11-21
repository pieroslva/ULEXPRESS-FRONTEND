import { useEffect, useState } from "react";
import { api } from "../../config/api";

const s = (n: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(Number(n));

export default function RepartidorDashboard() {
  const [asignados, setAsignados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = () => {
    setLoading(true);
    api.get("/pedidos")
      .then(({ data }) => {
        // Filtramos solo los que están EN CURSO (ACEPTADO)
        setAsignados(data.filter((p: any) => p.estado === 'ACEPTADO'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const entregar = async (id: number) => {
    if(!confirm("¿Confirmar que entregaste el pedido y recibiste el pago?")) return;
    try {
      await api.put(`/pedidos/${id}`, { estado: 'ENTREGADO' });
      alert("¡Pedido finalizado con éxito!");
      cargar(); // Recargar para que se vaya al historial
    } catch { alert("Error al finalizar."); }
  };

  return (
    <section className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mis Entregas en Curso</h1>
        <button onClick={cargar} className="text-sm text-blue-400 underline">Actualizar</button>
      </header>

      {loading ? <p>Cargando...</p> : asignados.length === 0 ? (
        <div className="p-8 text-center border border-white/10 rounded bg-white/5">
          <p className="text-gray-400 mb-2">No tienes entregas activas.</p>
          <a href="/repartidor/disponibles" className="text-blue-400 hover:underline">Ir a buscar pedidos</a>
        </div>
      ) : (
        <div className="space-y-4">
          {asignados.map((p) => (
            <div key={p.id} className="bg-white/5 p-5 rounded-xl border border-green-500/30">
              <div className="flex justify-between font-bold text-xl mb-2">
                <span className="text-green-400">#{String(p.id).padStart(8,'0')}</span>
                <span>{s(p.total)}</span>
              </div>
              <div className="text-sm mb-4">
                <p>Pago: <b className="uppercase text-white">{p.metodoPago}</b></p>
                <div className="mt-2 bg-black/20 p-2 rounded text-white/80">
                  {p.items?.map((it:any, i:number) => (
                    <div key={i}>• {it.cantidad}x {it.producto?.nombre}</div>
                  ))}
                </div>
              </div>
              <button onClick={() => entregar(p.id)} className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold text-white transition">
                MARCAR COMO ENTREGADO
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}