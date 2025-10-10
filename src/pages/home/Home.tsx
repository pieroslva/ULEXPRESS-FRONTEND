// src/pages/home/Home.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth.store";

export default function Home(){
  const { sesion } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const irATiendas = () => navigate(q.trim() ? `/tiendas?q=${encodeURIComponent(q)}` : "/tiendas");

  return (
    <div className="space-y-4">
      {/* 👇 Nombre del usuario logueado */}
      <p className="text-lg">Bienvenido, <b>{sesion?.nombre}</b></p>
      <div className="relative rounded-xl overflow-hidden">
        <img src="/img/brand/banner.jpg" className="h-56 md:h-72 w-full object-cover scale-[1.017]" />
        <img src="/img/brand/logo.png" className="h-10 absolute left-4 bottom-4" />
      </div>
      <div className="flex gap-3">
        <input value={q} onChange={(e)=>setQ(e.target.value)} className="border border-white/20 bg-transparent rounded px-3 py-2 flex-1" placeholder="Buscar locales" />
        <button onClick={irATiendas} className="bg-orange-500 hover:bg-orange-600 text-white rounded px-4 py-2">Ver Tiendas</button>
      </div>
    </div>
  );
}
