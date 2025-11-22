import { api } from "../config/api";

export const reportarIncidencia = async (
  pedidoId: string | number, 
  tipo: string, 
  descripcion: string
) => {
  // POST /api/pedidos/:id/reportar
  const { data } = await api.post(`/pedidos/${pedidoId}/reportar`, { 
    tipo, 
    descripcion 
  });
  return data;
};