import { useCarrito } from "../../store/carrito.store";
import { api } from "../../config/api"; 

export type MetodoPago = "yape" | "efectivo";

export type Pedido = {
  id: string;
  fecha: string;
  estado: "CREADO" | "ACEPTADO" | "ENTREGADO";
  total: number;
  metodo: MetodoPago;
};

export class CheckoutFacade {
  // Eliminamos el constructor y deliveryCalc porque ya no se usan aquí.

  async confirmar(metodo: MetodoPago): Promise<Pedido> {
    const { items, clear } = useCarrito.getState();
    // Eliminamos 'sub' porque no se usaba
    
    // Construimos el payload que espera el Backend
    const payload = {
      metodoPago: metodo,
      items: items.map(it => ({
        cantidad: it.cantidad,
        producto: { idProducto: it.producto.idProducto }
      }))
    };

    try {
      const { data } = await api.post("/pedidos", payload);
      
      clear(); // Limpia carrito local y visual
      return {
        id: data.id,
        fecha: data.fecha,
        estado: data.estado,
        total: Number(data.total),
        metodo: metodo
      };
    } catch (error) {
      console.error("Error creando pedido", error);
      throw error;
    }
  }
}