import React, { useState, useEffect, useRef } from "react";
import { api } from "../../config/api";

const useAuth = () => {
  return { sesion: { id: 123 } }; // simula sesión
}

type Mensaje = {
  id: number;
  pedido_id: number;
  usuario_id: number;
  texto: string;
  fecha: string;
};

const ChatFlotante = ({ pedidoId }: { pedidoId: number }) => {
  const { sesion } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto && mensajes.length === 0) {
      setMensajes([
        { id: 1, pedido_id: pedidoId, usuario_id: 99, texto: "Hola Leandro, voy en camino", fecha: new Date().toISOString() }
      ]);
    }
  }, [abierto]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    const msg: Mensaje = {
      id: Date.now(),
      pedido_id: pedidoId,
      usuario_id: sesion.id,
      texto: nuevoMensaje,
      fecha: new Date().toISOString(),
    };
    setMensajes([...mensajes, msg]);
    setNuevoMensaje("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {abierto && (
        <div className="bg-white w-80 h-96 rounded-lg shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden text-gray-800 font-sans animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-orange-500 p-3 text-white flex justify-between items-center shadow-sm">
            <div>
              <h4 className="font-bold text-sm">Chat Pedido #{pedidoId}</h4>
              <span className="text-xs opacity-90 block">Repartidor conectado</span>
            </div>
            <button onClick={() => setAbierto(false)} className="hover:bg-white/20 p-1 rounded">
              {/* Icono X */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-2 text-sm">
            {mensajes.map((m) => {
              const esMio = m.usuario_id === sesion.id;
              return (
                <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl ${esMio ? "bg-orange-100 text-orange-900 rounded-tr-none" : "bg-white border border-gray-200 rounded-tl-none"}`}>
                    <p>{m.texto}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={enviar} className="p-2 bg-white border-t flex gap-2">
            <input
              className="flex-1 bg-gray-100 text-sm px-3 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Escribir mensaje..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
            />
            <button type="submit" className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition">
              {/* Icono Enviar */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setAbierto(!abierto)}
        className={`${abierto ? "bg-gray-500" : "bg-orange-500 hover:bg-orange-600"} text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2`}
      >
        {/* Icono Mensaje */}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        {!abierto && <span className="font-bold text-sm pr-1">Chat</span>}
      </button>
    </div>
  );
};

export default function RepartidorDashboard() {
  const [asignados, setAsignados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = () => {
    setLoading(true);
    api.get("/pedidos")
      .then(({ data }) => {
        setAsignados(data.filter((p: any) => p.estado === "ACEPTADO"));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const entregar = async (id: number) => {
    if (!confirm("¿Confirmar que entregaste el pedido y recibiste el pago?")) return;
    try {
      await api.put(`/pedidos/${id}`, { estado: "ENTREGADO" });
      alert("¡Pedido finalizado con éxito!");
      cargar();
    } catch {
      alert("Error al finalizar.");
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mis Entregas en Curso</h1>
        <button onClick={cargar} className="text-sm text-blue-400 underline">
          Actualizar
        </button>
      </header>

      {loading ? (
        <p>Cargando...</p>
      ) : asignados.length === 0 ? (
        <div className="p-8 text-center border border-white/10 rounded bg-white/5">
          <p className="text-gray-400 mb-2">No tienes entregas activas.</p>
          <a href="/repartidor/disponibles" className="text-blue-400 hover:underline">
            Ir a buscar pedidos
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {asignados.map((p) => (
            <div key={p.id} className="bg-white/5 p-5 rounded-xl border border-green-500/30 relative">
              <div className="flex justify-between font-bold text-xl mb-2">
                <span className="text-green-400">#{String(p.id).padStart(8, "0")}</span>
                <span>{(p.total)}</span>
              </div>
              <div className="text-sm mb-4">
                <p>
                  Pago: <b className="uppercase text-white">{p.metodoPago}</b>
                </p>
                <div className="mt-2 bg-black/20 p-2 rounded text-white/80">
                  {p.items?.map((it: any, i: number) => (
                    <div key={i}>
                      • {it.cantidad}x {it.producto?.nombre}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => entregar(p.id)}
                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold text-white transition"
              >
                MARCAR COMO ENTREGADO
              </button>
              {/* Chat flotante para el pedido */}
              <ChatFlotante pedidoId={p.id} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
