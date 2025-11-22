import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// =============================================================================
// 🚧 ZONA DE IMPORTACIONES: DESCOMENTAR EN TU PROYECTO REAL
// =============================================================================
// import { useAuth } from "../../store/auth.store"; 
// import { api } from "../../config/api"; 

// =============================================================================
// 🔧 CÓDIGO TEMPORAL (SOLO PARA QUE FUNCIONE LA VISTA PREVIA AQUÍ) - BORRAR LUEGO
// =============================================================================
const useAuth = () => ({
  sesion: { id: 1, nombre: "Leandro", rol: "alumno" }
});

// Simulamos la instancia de Axios para que no falle la compilación
const api = {
  get: async (url: string) => {
    console.log(`[API GET] ${url}`);
    
    // Simulación: Devuelve un pedido PENDIENTE y luego de unos segundos ACEPTADO
    if (url.includes('/pedidos')) {
       // Cambia esto manualmente a 'PENDIENTE' si quieres probar el estado de espera
       const estadoSimulado = (Date.now() % 20000 > 5000) ? 'ACEPTADO' : 'PENDIENTE';
       
       return { 
         data: [
           // Este es el formato que espera tu código real
           { id: 12345, estado: estadoSimulado, total: 45.00, usuario_id: 1 }
         ]
       };
    }
    if (url.includes('/mensajes')) {
        return { data: [] }; // Array vacío inicial
    }
    return { data: {} };
  },
  post: async (url: string, body: any) => {
    console.log(`[API POST] Enviando a ${url}:`, body);
    return { data: { success: true } };
  }
};
// =============================================================================


// --- 1. TIPOS (Coinciden con tu BD) ---
interface Mensaje {
  id: number;
  pedido_id: number;
  usuario_id: number;
  texto: string;
  fecha: string;
}

interface Pedido {
    id: number;
    estado: string; // 'PENDIENTE', 'ACEPTADO', 'ENTREGADO', etc.
    total: number;
    usuario_id: number;
}

// --- 2. COMPONENTE CHAT FLOTANTE (Lógica Real) ---
const ChatFlotante = ({ pedidoId }: { pedidoId: number }) => {
  const { sesion } = useAuth();
  const [abierto, setAbierto] = useState(true); 
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2.1 Cargar mensajes del Backend
  const cargarMensajes = async () => {
    try {
        // GET real a tu endpoint /mensajes/ID
        const { data } = await api.get(`/mensajes/${pedidoId}`);
        if (Array.isArray(data)) {
            setMensajes(data as Mensaje[]);
        }
    } catch (error) {
        console.error("Error cargando mensajes:", error);
    }
  };

  // 2.2 Polling: Consultar cada 3 segundos por nuevos mensajes
  useEffect(() => {
      cargarMensajes();
      const intervalo = setInterval(cargarMensajes, 3000);
      return () => clearInterval(intervalo);
  }, [pedidoId]);

  // 2.3 Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, abierto]);

  // 2.4 Enviar mensaje (POST Real)
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    
    const textoTemp = nuevoMensaje;
    setNuevoMensaje(""); 

    // Agregar localmente para feedback instantáneo (Optimistic UI)
    const msgLocal: Mensaje = {
        id: Date.now(),
        pedido_id: pedidoId,
        usuario_id: sesion.id,
        texto: textoTemp,
        fecha: new Date().toISOString()
    };
    setMensajes(prev => [...prev, msgLocal]);

    try {
        // Enviamos a la base de datos
        await api.post('/mensajes', {
            pedido_id: pedidoId,
            usuario_id: sesion.id,
            texto: textoTemp
        });
        // Recargar para confirmar
        cargarMensajes();
    } catch (error) {
        console.error("Error enviando mensaje", error);
        alert("Error al enviar el mensaje");
    }
  };

  // Si está minimizado
  if (!abierto) {
      return (
        <button 
            onClick={() => setAbierto(true)}
            className="fixed bottom-4 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2 animate-bounce-subtle"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span className="font-bold text-sm pr-1">Chat</span>
        </button>
      );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end font-sans text-gray-800 animate-in slide-in-from-bottom-10 fade-in duration-300">
        <div className="bg-white w-80 h-96 rounded-lg shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden">
          {/* Header */}
          <div className="bg-orange-500 p-3 text-white flex justify-between items-center shadow-sm">
            <div>
                <h4 className="font-bold text-sm">Chat Pedido #{pedidoId}</h4>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-xs opacity-90">Repartidor conectado</span>
                </div>
            </div>
            <button onClick={() => setAbierto(false)} className="hover:bg-white/20 p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-2 text-sm">
            {mensajes.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs text-center px-4">
                    <p>Tu pedido ha sido aceptado.</p>
                    <p>¡Habla con tu repartidor aquí!</p>
                </div>
            )}
            {mensajes.map((m) => {
                const esMio = m.usuario_id === sesion.id;
                return (
                    <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-xl ${esMio ? 'bg-orange-100 text-orange-900 rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none shadow-sm'}`}>
                            <p>{m.texto}</p>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={enviar} className="p-2 bg-white border-t flex gap-2">
            <input 
                className="flex-1 bg-gray-100 text-sm px-3 py-2 rounded-full focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Escribe un mensaje..."
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
            />
            <button type="submit" className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
    </div>
  );
};

// --- 3. COMPONENTE PRINCIPAL ---
export default function HomeAlumno() {
  const { sesion } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  
  // Estado local para guardar el pedido activo encontrado
  const [pedidoActivo, setPedidoActivo] = useState<Pedido | null>(null);

  const irATiendas = () => navigate(q.trim() ? `/tiendas?q=${encodeURIComponent(q)}` : "/tiendas");

  // Lógica Real: Consultar API para ver si hay pedido
  const verificarPedidoActivo = async () => {
      if (!sesion?.id) return;

      try {
          // Consulta a tu backend: pedidos de este usuario
          const { data } = await api.get(`/pedidos?usuario_id=${sesion.id}`);
          
          if (Array.isArray(data)) {
              // Buscamos si tiene alguno activo
              const activo = data.find((p: any) => 
                 p.estado === 'ACEPTADO' || p.estado === 'PENDIENTE' || p.estado === 'EN_CAMINO'
              );
              // Actualizamos estado. Si pasa a 'ACEPTADO', el chat se mostrará.
              setPedidoActivo(activo || null);
          }
      } catch (error) {
          console.error("Error verificando pedidos:", error);
      }
  };

  // Polling: Verificar estado cada 4 segundos
  useEffect(() => {
      verificarPedidoActivo();
      const intervalo = setInterval(verificarPedidoActivo, 4000);
      return () => clearInterval(intervalo);
  }, [sesion]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6 font-sans relative">
        <div className="space-y-4 max-w-5xl mx-auto">
            <p className="text-lg">Bienvenido, <b>{sesion?.nombre}</b></p>

            {/* Banner */}
            <div className="relative rounded-xl overflow-hidden group">
                <img 
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" 
                    className="h-56 md:h-72 w-full object-cover scale-[1.017] group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="h-10 w-10 bg-white/90 absolute left-4 bottom-4 rounded-full flex items-center justify-center text-orange-600 font-bold">
                    U
                </div>
            </div>

            {/* Buscador */}
            <div className="flex gap-3">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="bg-white/10 outline-none border border-white/10 focus:border-white/30 transition rounded px-3 py-2 flex-1 placeholder-gray-400 text-white"
                    placeholder="Buscar locales"
                />
                <button onClick={irATiendas} className="bg-orange-500 hover:bg-orange-600 text-white rounded px-4 py-2 font-medium">
                    Ver Tiendas
                </button>
            </div>
        </div>

        {/* Aviso visual si está esperando */}
        {pedidoActivo && pedidoActivo.estado === 'PENDIENTE' && (
             <div className="fixed bottom-4 right-4 bg-yellow-500/90 text-black px-4 py-2 rounded-full shadow-lg backdrop-blur-sm text-sm flex items-center gap-2 animate-pulse">
                <div className="w-2 h-2 bg-black rounded-full animate-ping"></div>
                Esperando repartidor...
             </div>
        )}

        {/* CHAT (Se monta SOLO si el estado es ACEPTADO) */}
        {pedidoActivo && pedidoActivo.estado === 'ACEPTADO' && (
            <ChatFlotante pedidoId={pedidoActivo.id} />
        )}
    </div>
  );
}