import { create } from "zustand";
import { api } from "../config/api";

export type Producto = { idProducto:number; nombre:string; precio:number; imagen:string; };
export type Item = { producto: Producto; cantidad: number };

export const useCarrito = create<{
  items: Item[];
  fetchFromServer: () => Promise<void>; // Nueva función para cargar DB
  add: (it: Item) => void;
  remove: (id: number) => void;
  clear: () => void;
  subtotal: () => number;
}>((set, get) => ({
  items: [],

  // 1. Cargar carrito desde la Base de Datos al iniciar sesión
  fetchFromServer: async () => {
    try {
      const { data } = await api.get("/carrito"); 
      // Mapeo de respuesta del backend al formato del frontend
      if (data && data.items) {
        const mappedItems = data.items.map((i: any) => ({
          cantidad: i.cantidad,
          producto: {
            idProducto: i.producto.id,
            nombre: i.producto.nombre,
            precio: Number(i.producto.precio),
            imagen: i.producto.imagen_url || "/img/productos/coffee-small.jpg"
          }
        }));
        set({ items: mappedItems });
      }
    } catch (e) {
      console.error("No se pudo cargar el carrito del servidor", e);
    }
  },

  add: (it) => {
    // Optimista: Actualizamos UI primero
    const items = [...get().items];
    const i = items.findIndex(x => x.producto.idProducto === it.producto.idProducto);
    if (i >= 0) items[i].cantidad += it.cantidad; else items.push(it);
    set({ items });

    // Sincronizar con Backend
    api.post("/carrito", { 
      productoId: it.producto.idProducto, 
      cantidad: it.cantidad 
    }).catch(err => console.error("Error guardando en carrito", err));
  },

  remove: (idProducto) => {
    // Actualizamos UI local:
    const items = get().items.filter(x => x.producto.idProducto !== idProducto);
    set({ items });

    // Nota: El backend actualmente espera el ID del item_carrito para borrar.
    // Por ahora, solo actualizamos visualmente hasta alinear esa parte del API.
  },

  clear: () => { 
    set({ items: [] }); 
  },

  subtotal: () => get().items.reduce((s, it) => s + it.producto.precio * it.cantidad, 0),
}));