// src/pages/Alumno_Repartidor/Alumno_Repartidor.tsx
type PedidoAsignado = {
  id: string;
  destino: string;
  tienda: string;
  total: number;
  estado: "ASIGNADO" | "EN_CAMINO" | "ENTREGADO";
};

const s = (n:number)=> new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN"}).format(n);

// demo:  lee historial y arma 1–2 pedidos “asignados”
function mockAsignados(): PedidoAsignado[] {
  try {
    const hist = JSON.parse(localStorage.getItem("historial") || "[]");
    return (hist as any[]).slice(-2).map((p:any)=>({
      id: p.id,
      destino: "Puerta Edificio E",
      tienda: "ULExpress",
      total: p.total,
      estado: "ASIGNADO" as const,
    }));
  } catch { return []; }
}

export default function Alumno_Repartidor(){
  const asignados = mockAsignados();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Pedidos asignados</h1>
      {asignados.length===0 ? (
        <p className="text-gray-400">Sin pedidos asignados por ahora.</p>
      ) : (
        <div className="grid gap-4">
          {asignados.map(p=>(
            <div key={p.id} className="border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">#{p.id.slice(0,8)} — {p.tienda}</div>
                <div className="text-sm text-gray-400">{p.destino}</div>
              </div>
              <div className="text-right">
                <div>{s(p.total)}</div>
                <span className="text-xs px-2 py-1 rounded bg-white/10">{p.estado}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
