// src/pages/Historial/Historial.tsx
type Pedido = {
  id: string;
  fecha: string;
  estado: "CREADO" | "ACEPTADO" | "ENTREGADO";
  items: { producto: { idProducto:number; nombre:string; precio:number; imagen?:string }, cantidad:number }[];
  subtotal: number;
  delivery: number;
  total: number;
};

const s = (n:number)=> new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN"}).format(n);

export default function Historial(){
  const pedidos: Pedido[] = (() => {
    try { return JSON.parse(localStorage.getItem("historial") || "[]"); }
    catch { return []; }
  })();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Historial de pedidos</h1>

      {pedidos.length === 0 ? (
        <p className="text-gray-400">Aún no tienes pedidos confirmados.</p>
      ) : (
        <div className="grid gap-4">
          {pedidos.slice().reverse().map(p => (
            <div key={p.id} className="border border-white/10 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">Pedido #{p.id.slice(0,8)}</h3>
                  <p className="text-sm text-gray-400">{new Date(p.fecha).toLocaleString("es-PE")}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-white/10">{p.estado}</span>
              </div>

              <div className="mt-3 space-y-2">
                {p.items.map(it=>(
                  <div key={it.producto.idProducto} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {it.producto.imagen && <img src={it.producto.imagen} className="h-10 w-10 object-cover rounded" />}
                      <div>{it.producto.nombre} x{it.cantidad}</div>
                    </div>
                    <div>{s(it.producto.precio * it.cantidad)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 border-t border-white/10 pt-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{s(p.subtotal)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{s(p.delivery)}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>{s(p.total)}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
