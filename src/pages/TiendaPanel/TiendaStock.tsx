import { useEffect, useState } from "react";
import { obtenerTienda, setProductoStock, type Tienda } from "../../services/TiendasService";
import { useAuth } from "../../store/auth.store";

export default function TiendaStock(){
  const { sesion } = useAuth();
  const tiendaId = sesion?.tiendaId!;
  const [tienda, setTienda] = useState<Tienda>();

  useEffect(()=>{ if(tiendaId) obtenerTienda(tiendaId).then(setTienda); }, [tiendaId]);

  if(!tienda) return <p>Cargando...</p>;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {tienda.catalogo.map(p=>(
        <div key={p.idProducto} className="border border-white/10 rounded-xl p-4">
          <img src={p.imagen} className="h-36 w-full object-cover rounded"/>
          <h4 className="mt-2 font-semibold">{p.nombre}</h4>
          <p className="text-sm text-gray-400">S/ {p.precio}</p>

          <label className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={p.stock !== false}
              onChange={(e)=>{
                setProductoStock(tiendaId, p.idProducto, e.target.checked);
                obtenerTienda(tiendaId).then(setTienda);
              }}
            />
            <span>{p.stock === false ? "Sin stock" : "Con stock"}</span>
          </label>
        </div>
      ))}
    </div>
  );
}
