// src/pages/auth/Login.tsx
import { useAuth } from "../../store/auth.store";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const f = e.target as HTMLFormElement;
    const codigo = (f.elements.namedItem("codigo") as HTMLInputElement).value;
    const pass = (f.elements.namedItem("pass") as HTMLInputElement).value;

    try {
      await login(codigo, pass);

      // 👉 justo después de loguear: revisar carrito previo
      let items: unknown = [];
      try { items = JSON.parse(localStorage.getItem("carrito") || "[]"); } catch {}
      if (Array.isArray(items) && items.length > 0) {
        const ir = window.confirm(`Tienes ${items.length} producto(s) en tu carrito de la sesión anterior. ¿Quieres revisarlos ahora?`);
        navigate(ir ? "/carrito" : "/");
      } else {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 place-items-center bg-zinc-900 text-white">
      <div className="w-full h-full hidden md:block">
        <img src="/img/brand/banner.jpg" className="w-full h-full object-cover" alt="Campus ULima" />
      </div>

      <form onSubmit={onSubmit} className="w-full max-w-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <img src="/img/brand/logo.png" alt="ULExpress" className="h-8" />
          <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        </div>

        <input name="codigo" placeholder="Código" className="w-full bg-zinc-800 rounded px-3 py-2 mb-3" />
        <input name="pass" type="password" placeholder="Contraseña" className="w-full bg-zinc-800 rounded px-3 py-2 mb-4" />
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <button disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 rounded px-4 py-2 font-semibold">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-xs opacity-70 mt-3">
          Alumno: <b>20194613</b> / <b>1234</b> · Tienda: <b>TDUNKIN</b> / <b>dunkin</b>
        </p>
      </form>
    </div>
  );
}
