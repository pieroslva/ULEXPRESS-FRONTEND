import { api } from "../config/api";

export type Producto = {
  idProducto: number; // En DB es 'id' pero el front usa 'idProducto', mapeamos abajo
  nombre: string;
  precio: number;
  imagen: string;
  stock?: boolean;
};

export type Tienda = {
  idTienda: number;
  nombre: string;
  ubicacion: string;
  logo: string;
  catalogo: Producto[];
};

// Mapeador: Convierte formato Backend (DB) a formato Frontend
const mapTienda = (t: any): Tienda => ({
  idTienda: t.id, // Backend: id -> Frontend: idTienda
  nombre: t.nombre,
  ubicacion: t.ubicacion,
  logo: t.logo_url || "/img/brand/logo.png", // Fallback si es null
  catalogo: (t.catalogo || []).map((p: any) => ({
    idProducto: p.id,
    nombre: p.nombre,
    precio: Number(p.precio), // Postgres devuelve decimal como string a veces
    imagen: p.imagen_url || "/img/productos/coffee-medium.jpg",
    stock: p.stock
  }))
});

export const listarTiendas = async (query?: string): Promise<Tienda[]> => {
  try {
    const url = query ? `/tiendas?q=${query}` : "/tiendas";
    const { data } = await api.get(url);
    // El backend devuelve lista de tiendas. Mapeamos para ajustar nombres de propiedades.
    return data.map((t: any) => ({
      idTienda: t.idTienda || t.id, // Ajuste según lo que devuelve tu controlador
      nombre: t.nombre,
      ubicacion: t.ubicacion,
      logo: t.logo || t.logo_url,
      catalogo: [] // La lista general no trae productos por defecto
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const obtenerTienda = async (id: number): Promise<Tienda | undefined> => {
  try {
    const { data } = await api.get(`/tiendas/${id}`);
    return mapTienda(data);
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

// ADMIN TIENDA (Opcional: Conexión con endpoints de admin)
export function setProductoStock(_tiendaId: number, idProducto: number, stock: boolean) {
  api.patch(`/tiendas/productos/${idProducto}/stock`, { stock }).catch(console.error);
}

export function setProductoPrecio(_tiendaId: number, idProducto: number, precio: number) {
   api.patch(`/tiendas/productos/${idProducto}/precio`, { precio }).catch(console.error);
}

export async function addProducto(_tiendaId: number, data: { nombre: string; precio: number; imagen: string; stock?: boolean }) {
  try {
    const res = await api.post("/tiendas/productos", data);
    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}