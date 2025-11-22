import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client"; // <--- Importante
import { api } from "../../config/api";
import { useAuth } from "../../store/auth.store";

// URL del Socket
const SOCKET_URL = "http://localhost:3000";

type Mensaje = {
  id: number;
  pedidoId: number;
  usuarioId: number;
  texto: string;
  fecha: string;
  emisor?: { nombre: string };
};

const ChatFlotante = ({ pedidoId }: { pedidoId: number }) => {
  const { sesion } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Efecto de conexión (Solo cuando se abre el chat)
  useEffect(() => {
    if (abierto) {
        // A) Cargar historial previo
        api.get(`/pedidos/${pedidoId}/mensajes`)
           .then(({ data }) => {
               if(Array.isArray(data)) setMensajes(data);
           })
           .catch(console.error);

        // B) Conectar Socket
        socketRef.current = io(SOCKET_URL);
        const socket = socketRef.current;

        // Unirse a la sala
        socket.emit("join_pedido", pedidoId);

        // Escuchar mensajes
        socket.on("receive_message", (msg: any) => {
            const normalizedMsg: Mensaje = {
                id: msg.id || Date.now(),
                pedidoId: msg.pedidoId || msg.pedido_id,
                usuarioId: msg.usuarioId || msg.usuario_id,
                texto: msg.texto,
                fecha: msg.fecha || new Date().toISOString()
            };
            setMensajes(prev => [...prev, normalizedMsg]);
        });

        return () => {
            socket.disconnect();
        };
    }
  }, [abierto, pedidoId]);

  // 2. Scroll al fondo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  // 3. Enviar mensaje (CORREGIDO)
  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !sesion?.id) return;
    
    const texto = nuevoMensaje;
    setNuevoMensaje("");

    const payload = {
        pedidoId, // Backend espera "pedidoId"
        usuarioId: sesion.id,
        texto
    };

    // Enviamos por Socket (El backend lo guarda y lo reenvía)
    if (socketRef.current) {
        socketRef.current.emit("send_message", payload);
    }
  };

  // --- Renderizado ---

  if (!abierto) {
      return (
        <button 
          onClick={() => setAbierto(true)}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold flex items-center justify-center gap-2"
        >
          💬 Abrir Chat con Cliente
        </button>
      );
  }

  return (
    <div className="mt-3 bg-zinc-800 border border-white/10 rounded-lg overflow-hidden">
       {/* Header del Chat */}
       <div className="bg-zinc-900 p-2 flex justify-between items-center border-b border-white/10">
          <span className="text-sm font-bold text-gray-300">Chat del Pedido</span>
          <button onClick={() => setAbierto(false)} className="text-gray-400 hover:text-white">✕</button>
       </div>

       {/* Área de Mensajes */}
       <div className="h-48 overflow-y-auto p-3 space-y-2 bg-black/20">
          {mensajes.length === 0 && (
              <p className="text-center text-xs text-gray-500 mt-4">Escribe al cliente...</p>
          )}
          {mensajes.map((m, i) => {
              // Identificar si es mensaje mío
              const esMio = m.usuarioId === sesion?.id;
              return (
                  <div key={i} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-1.5 rounded-lg text-sm ${
                          esMio 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-zinc-700 text-gray-200 rounded-tl-none'
                      }`}>
                          <div className="text-xs opacity-50 font-bold mb-0.5">
                              {esMio ? 'Yo' : 'Cliente'}
                          </div>
                          {m.texto}
                      </div>
                  </div>
              );
          })}
          <div ref={messagesEndRef}/>
       </div>

       {/* Input */}
       <form onSubmit={enviar} className="p-2 bg-zinc-900 flex gap-2">
          <input 
            className="flex-1 bg-zinc-800 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            placeholder="Mensaje..."
            value={nuevoMensaje}
            onChange={e => setNuevoMensaje(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
             ➤
          </button>
       </form>
    </div>
  );
};

export default function RepartidorDashboard() {
  const [asignados, setAsignados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = () => {
    setLoading(true);
    // Se asume que GET /api/pedidos trae el historial completo, filtramos aquí.
    // Idealmente el backend tendría GET /api/repartidor/mis-pedidos
    api.get("/pedidos") 
      .then(({ data }) => {
        // Filtramos los que están "ACEPTADO" o "EN_CAMINO"
        const enCurso = data.filter((p: any) => 
            p.estado === "ACEPTADO" || p.estado === "EN_CAMINO"
        );
        setAsignados(enCurso);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  const entregar = async (id: number) => {
    if (!confirm("¿Confirmar que entregaste el pedido?")) return;
    try {
      await api.put(`/pedidos/${id}`, { estado: "ENTREGADO" });
      alert("¡Pedido entregado!");
      cargar();
    } catch {
      alert("Error al finalizar.");
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mis Entregas en Curso</h1>
        <button onClick={cargar} className="text-sm text-blue-400 underline">Actualizar</button>
      </header>

      {loading ? <p>Cargando...</p> : asignados.length === 0 ? (
        <div className="p-8 text-center border border-white/10 rounded bg-white/5">
          <p className="text-gray-400 mb-2">No tienes entregas activas.</p>
          <a href="/repartidor/disponibles" className="text-blue-400 hover:underline">
            Ir a buscar pedidos disponibles
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {asignados.map((p) => (
            <div key={p.id} className="bg-white/5 p-5 rounded-xl border border-green-500/30 flex flex-col h-full">
              <div className="flex justify-between font-bold text-xl mb-2">
                <span className="text-green-400">#{String(p.id).padStart(8, "0")}</span>
                <span>S/ {p.total}</span>
              </div>
              
              <div className="text-sm mb-4 flex-1">
                <p className="mb-1">Pago: <b className="uppercase text-white">{p.metodoPago}</b></p>
                <div className="bg-black/20 p-2 rounded text-white/80 text-xs space-y-1">
                  {p.items?.map((it: any, i: number) => (
                    <div key={i}>• {it.cantidad}x {it.producto?.nombre}</div>
                  ))}
                </div>
              </div>

              {/* Aquí está el chat integrado en la tarjeta */}
              <ChatFlotante pedidoId={Number(p.id)} />

              <button
                onClick={() => entregar(p.id)}
                className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold text-white transition mt-4"
              >
                MARCAR COMO ENTREGADO
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}