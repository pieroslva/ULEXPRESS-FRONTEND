// src/app/ProtectedLayout.tsx
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth.store";

export default function ProtectedLayout() {
  const { sesion, bootstrapped, logout } = useAuth();
  const { pathname } = useLocation();

  if (!bootstrapped) return null;
  if (!sesion) return <Navigate to="/login" replace />;

  const isActive = (to: string) =>
    pathname === to || pathname.startsWith(to + "/")
      ? "underline underline-offset-4"
      : "hover:underline";

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* HEADER a todo lo ancho */}
      <header className="w-full bg-orange-500 text-white">
        <div className="w-full px-6 flex items-center justify-between py-3">
          <Link to="/" className="font-bold flex items-center gap-2">
            <img src="/img/brand/logo.png" className="h-6" alt="ULExpress" />
            <span>ULEXPRESS Delivery</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link to="/tiendas" className={isActive("/tiendas")}>Tiendas</Link>
            <Link to="/carrito" className={isActive("/carrito")}>Mi carrito</Link>
            <Link to="/historial" className={isActive("/historial")}>Historial</Link>

            {/* Menú según rol */}
            {sesion?.rol === "repartidor" && (
              <Link to="/alumno-repartidor" className={isActive("/alumno-repartidor")}>
                Repartidor
              </Link>
            )}
            {sesion?.rol === "tienda" && (
              <Link to="/tienda" className={isActive("/tienda")}>
                Panel Tienda
              </Link>
            )}

            <span className="text-sm opacity-90 hidden sm:inline">
              {sesion.nombre}
            </span>
            <button onClick={logout} className="bg-black/20 px-3 py-1 rounded">
              Salir
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN a todo lo ancho */}
      <main className="w-full px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
}
