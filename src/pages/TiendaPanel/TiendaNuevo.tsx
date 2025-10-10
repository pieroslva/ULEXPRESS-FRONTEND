import { useState } from "react";
import { addProducto } from "../../services/TiendasService";
import { useAuth } from "../../store/auth.store";

export default function TiendaNuevo(){
  const { sesion } = useAuth();
  const tiendaId = sesion?.tiendaId!;
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState<number>(10);
  const [imagen, setImagen] = useState("/img/productos/coffee-small.jpg"); // ruta en public/
  const [stock, setStock] = useState(true);
  const [ok, setOk] = useState<string | null>(null);

  const submit = (e:React.FormEvent)=>{
    e.preventDefault();
    const p = addProducto(tiendaId, { nombre, precio: Number(precio), imagen, stock });
    setOk(p ? `Producto #${p.idProducto} creado` : "No se pudo crear");
    setNombre("");
    setPrecio(10);
  };

  return (
    <form onSubmit={submit} className="max-w-xl space-y-3">
      <div>
        <label className="block text-sm mb-1">Nombre</label>
        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2"
               value={nombre} onChange={e=>setNombre(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Precio (S/)</label>
        <input type="number" step="0.1" min="0"
               className="w-full bg-transparent border border-white/20 rounded px-3 py-2"
               value={precio} onChange={e=>setPrecio(parseFloat(e.target.value || "0"))} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Imagen (ruta en /public)</label>
        <input className="w-full bg-transparent border border-white/20 rounded px-3 py-2"
               value={imagen} onChange={e=>setImagen(e.target.value)} placeholder="/img/productos/mi-foto.jpg" />
        <p className="text-xs text-gray-400 mt-1">Ej: /img/productos/coffee-medium.jpg</p>
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={stock} onChange={e=>setStock(e.target.checked)} />
        <span>Con stock</span>
      </label>

      <button className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2">Crear</button>
      {ok && <p className="text-sm text-green-400">{ok}</p>}
    </form>
  );
}
