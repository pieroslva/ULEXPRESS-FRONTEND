import { useEffect, useState } from "react";
import { obtenerTienda, setProductoPrecio, type Tienda } from "../../services/TiendasService";
import { useAuth } from "../../store/auth.store";

export default function TiendaPrecios(){
  const { sesion } = useAuth();
  const tiendaId = sesion?.tiendaId!;
  const [tienda, setTienda] = useState<Tienda>();
  const [edit, setEdit] = useState<Record<number, number>>({});

  useEffect(()=>{ if(tiendaId) obtenerTienda(tiendaId).then(t=>{
    setTienda(t);
    if (t) {
      const init: Record<number, number> = {};
      t.catalogo.forEach(p => init[p.idProducto] = p.precio);
      setEdit(init);
    }
  }); }, [tiendaId]);

  if(!tienda) return <p>Cargando...</p>;

  return (
    <div className="space-y-4">
      {tienda.catalogo.map(p=>(
        <div key={p.idProducto} className="border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={p.imagen} className="h-12 w-12 object-cover rounded" />
            <div>
              <div className="font-semibold">{p.nombre}</div>
              <div className="text-xs text-gray-400">ID {p.idProducto}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>S/</span>
            <input
              type="number" step="0.1" min="0"
              className="w-24 bg-transparent border border-white/20 rounded px-2 py-1 text-right"
              value={edit[p.idProducto] ?? p.precio}
              onChange={(e)=>setEdit(x=>({...x, [p.idProducto]: parseFloat(e.target.value || "0")}))}
            />
            <button
              className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded"
              onClick={()=>{
                const nuevo = edit[p.idProducto] ?? p.precio;
                setProductoPrecio(tiendaId, p.idProducto, Number(nuevo));
                obtenerTienda(tiendaId).then(setTienda);
              }}
            >
              Guardar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
