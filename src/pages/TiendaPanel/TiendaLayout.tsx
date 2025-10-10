import { Link, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../store/auth.store";

export default function TiendaLayout(){
  const { sesion } = useAuth();
  if (sesion?.rol !== "tienda") return <Navigate to="/" replace/>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Panel de Tienda</h1>
      <div className="flex gap-2">
        <Link to="/tienda/stock"   className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Stock</Link>
        <Link to="/tienda/precios" className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Precios</Link>
        <Link to="/tienda/nuevo"   className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded">Añadir producto</Link>
      </div>
      <Outlet/>
    </section>
  );
}
