import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client"; // npm install socket.io-client
import { useAuth } from "../../store/auth.store";
import { api } from "../../config/api"; // Asegúrate de que este path sea correcto

// Configuración del Socket
const SOCKET_URL = "http://localhost:3000";

// --- TIPOS ---
interface Mensaje {
  id: number;
  pedidoId: number;
  usuarioId: number;
  texto: string;
  fecha: string;
  emisor?: { nombre: string }; // Opcional para mostrar nombre
}

interface Pedido {
  id: number;
  estado: string; 
  total: number;
  usuario_id: number;
}

// --- COMPONENTE CHAT FLOTANTE ---
const ChatFlotante = ({ pedidoId }: { pedidoId: number }) => {
  const { sesion } = useAuth();
  const [abierto, setAbierto] = useState(true); 
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  
  // Refs para mantener conexión y scroll
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Efecto para cargar historial y conectar Socket
  useEffect(() => {
    if (!pedidoId) return;

    // A) Cargar historial de la API
    api.get(`/pedidos/${pedidoId}/mensajes`)
       .then(({ data }) => {
         if (Array.isArray(data)) setMensajes(data);
       })
       .catch((err) => console.error("Error cargando chat:", err));

    // B) Conectar Socket
    socketRef.current = io(SOCKET_URL);
    const socket = socketRef.current;

    // Unirse a la sala
    socket.emit("join_pedido", pedidoId);

    // Escuchar mensajes
    socket.on("receive_message", (msg: any) => {
       // Normalizamos el objeto mensaje por si el back manda nombres distintos
       const nuevoMsg: Mensaje = {
         id: msg.id || Date.now(),
         pedidoId: msg.pedidoId || msg.pedido_id,
         usuarioId: msg.usuarioId || msg.usuario_id,
         texto: msg.texto,
         fecha: msg.fecha || new Date().toISOString()
       };
       setMensajes((prev) => [...prev, nuevoMsg]);
    });

    // Cleanup al desmontar
    return () => {
      socket.disconnect();
    };
  }, [pedidoId]);

  // 2. Efecto para scroll automático
  useEffect(() => {
    if (abierto) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensajes, abierto]);

  // 3. Función enviar
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !sesion?.id) return;
    
    const textoTemp = texto;
    setTexto(""); // Limpiar input rápido

    const datosMensaje = {
        pedidoId: pedidoId,
        usuarioId: sesion.id, // TypeScript ahora reconoce esto gracias al Paso 1
        texto: textoTemp,
        fecha: new Date().toISOString()
    };

    // Emitir al socket
    if (socketRef.current) {
      socketRef.current.emit("send_message", datosMensaje);
    }
  };

  // Renderizado Minimizado
  if (!abierto) {
      return (
        <button 
            onClick={() => setAbierto(true)}
            className="fixed bottom-4 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
        >
            <span>💬 Chat</span>
        </button>
      );
  }

  // Renderizado Abierto
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end w-80 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white w-full h-96 rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 p-3 text-white flex justify-between items-center shadow">
            <div>
                <h4 className="font-bold text-sm">Pedido #{pedidoId}</h4>
                <span className="text-xs opacity-90 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/> En vivo
                </span>
            </div>
            <button onClick={() => setAbierto(false)} className="hover:bg-white/20 p-1 rounded">✕</button>
          </div>

          {/* Lista de Mensajes */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-2 text-sm text-black">
            {mensajes.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                  <p>Conectado con el repartidor.</p>
                </div>
            )}
            
            {mensajes.map((m, i) => {
                // Verificar si el mensaje es mío
                const esMio = m.usuarioId === sesion?.id;
                return (
                    <div key={i} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                          esMio 
                            ? 'bg-orange-100 text-orange-900 rounded-tr-none' 
                            : 'bg-white border border-gray-200 rounded-tl-none shadow-sm'
                        }`}>
                            <p>{m.texto}</p>
                            <span className="text-[10px] opacity-50 block text-right mt-1">
                              {new Date(m.fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={enviar} className="p-2 bg-white border-t flex gap-2">
            <input 
                className="flex-1 bg-gray-100 text-sm px-3 py-2 rounded-full text-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Escribe un mensaje..."
                value={texto}
                onChange={e => setTexto(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!texto.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-2 rounded-full transition-colors"
            >
               ➤
            </button>
          </form>
        </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---
export default function HomeAlumno() {
  const { sesion } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const [pedidoActivo, setPedidoActivo] = useState<Pedido | null>(null);

  const irATiendas = () => navigate(q.trim() ? `/tiendas?q=${encodeURIComponent(q)}` : "/tiendas");

  // Verificar si hay un pedido activo
  const verificarPedidoActivo = async () => {
      if (!sesion) return; 

      try {
          const { data } = await api.get(`/pedidos`); 
          if (Array.isArray(data)) {
              // Buscamos el último activo (creado, aceptado, o en camino)
              const activo = data.find((p: any) => 
                 ['CREADO', 'PENDIENTE', 'ACEPTADO', 'EN_CAMINO'].includes(p.estado)
              );
              
              // Convertimos el ID a número por seguridad
              if (activo) {
                setPedidoActivo({
                  ...activo,
                  id: Number(activo.id),
                  usuario_id: Number(activo.users_id || activo.usuarioId)
                });
              } else {
                setPedidoActivo(null);
              }
          }
      } catch (error) {
          console.error("Error verificando pedidos:", error);
      }
  };

  useEffect(() => {
      verificarPedidoActivo();
      const intervalo = setInterval(verificarPedidoActivo, 5000);
      return () => clearInterval(intervalo);
  }, [sesion]);

  return (
    <div className="space-y-6">
        <div>
          <p className="text-lg text-gray-200">Hola,</p>
          <h1 className="text-3xl font-bold text-white">{sesion?.nombre}</h1>
        </div>

        {/* Banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl group h-64">
            <img 
              src="/img/brand/banner.jpg" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="Campus"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
               <img src="/img/brand/logo.png" className="h-12 w-12 mb-2" alt="Logo" />
               <p className="text-white/90 font-medium">¿Qué se te antoja hoy?</p>
            </div>
        </div>

        {/* Buscador */}
        <div className="flex gap-2 bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-sm">
            <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="bg-transparent outline-none text-white placeholder-white/40 px-4 py-3 flex-1"
                placeholder="Buscar tiendas o productos..."
            />
            <button 
              onClick={irATiendas} 
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
                Buscar
            </button>
        </div>

        {/* Notificación de Estado */}
        {pedidoActivo && pedidoActivo.estado === 'CREADO' && (
             <div className="fixed bottom-4 right-4 bg-zinc-800 text-white border border-white/10 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-pulse z-40">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"/>
                <div>
                  <p className="font-bold text-sm">Buscando repartidor...</p>
                  <p className="text-xs opacity-60">Pedido #{pedidoActivo.id}</p>
                </div>
             </div>
        )}

        {/* Chat condicional */}
        {pedidoActivo && (pedidoActivo.estado === 'ACEPTADO' || pedidoActivo.estado === 'EN_CAMINO') && (
            <ChatFlotante pedidoId={pedidoActivo.id} />
        )}
    </div>
  );
}