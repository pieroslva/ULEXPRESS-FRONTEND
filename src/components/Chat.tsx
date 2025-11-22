import { useEffect, useState } from "react";
import { api } from "../config/api";
//import { socket } from "../config/api"; // ajústalo si está en otro folder
import { socket } from "../config/api";

// Tipo del mensaje
interface Mensaje {
    id?: number;
    pedidoId: number;
    usuarioId: number;
    texto: string;
    fecha?: string;
}

export default function Chat({ pedidoId, usuarioId }: { pedidoId: number; usuarioId: number }) {
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [texto, setTexto] = useState<string>("");

    // Cargar mensajes
    useEffect(() => {
        api.get(`/api/mensajes/${pedidoId}`)
            .then((res: any) => setMensajes(res.data))
            .catch((err: any) => console.error(err));
    }, [pedidoId]);

    // Unir al room
    useEffect(() => {
        socket.emit("join_room", `pedido_${pedidoId}`);
    }, [pedidoId]);

    // Recibir mensajes
    useEffect(() => {
        const handler = (msg: Mensaje) => {
            setMensajes((prev) => [...prev, msg]);
        };

        socket.on("receive_message", handler);

        return () => {
            socket.off("receive_message", handler);
        };
    }, []);


    // Enviar mensaje
    const enviar = async () => {
        if (texto.trim() === "") return;

        // Guardar en BD
        await api.post("/api/mensajes", {
            pedido_id: pedidoId,
            texto
        });

        // Emitir por socket
        socket.emit("send_message", {
            pedidoId,
            usuarioId,
            texto
        });

        setTexto("");
    };

    return (
        <div style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "300px",
            height: "380px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 2000
        }}>
            <div style={{
                background: "#4A90E2",
                color: "white",
                padding: "10px",
                fontWeight: "bold",
                textAlign: "center"
            }}>
                Chat con el repartidor
            </div>

            <div style={{
                flex: 1,
                padding: "10px",
                overflowY: "auto"
            }}>
                {mensajes.map((m, i) => (
                    <div key={i} style={{
                        background: m.usuarioId === usuarioId ? "#DCF8C6" : "#EEE",
                        padding: "6px 10px",
                        borderRadius: "10px",
                        marginBottom: "8px",
                        alignSelf: m.usuarioId === usuarioId ? "flex-end" : "flex-start",
                        maxWidth: "80%"
                    }}>
                        {m.texto}
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", padding: "10px" }}>
                <input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: "1px solid #CCC",
                        marginRight: "10px"
                    }}
                />
                <button
                    onClick={enviar}
                    style={{
                        padding: "8px 12px",
                        background: "#4A90E2",
                        color: "white",
                        borderRadius: "8px",
                        border: "none"
                    }}
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}
