// src/services/TiendasService.ts
export type Producto = {
  idProducto: number;
  nombre: string;
  precio: number;
  imagen: string;
  stock?: boolean; // ← nuevo
};

export type Tienda = {
  idTienda: number;
  nombre: string;
  ubicacion: string;
  logo: string;
  catalogo: Producto[];
};

// ====== Seed (si no hay nada en localStorage) ======
const seed: Tienda[] = [
  {
    idTienda: 1,
    nombre: "DUNKIN DONUTS",
    ubicacion: "ULima - Edificio D",
    logo: "/img/tiendas/dunkin.jpg",
    catalogo: [
      { idProducto: 101, nombre: "Café Pequeño", precio: 8,  imagen: "/img/productos/coffee-small.jpg",  stock: true },
      { idProducto: 102, nombre: "Café Mediano", precio: 10, imagen: "/img/productos/coffee-medium.jpg", stock: true },
      { idProducto: 103, nombre: "Café Grande",  precio: 12, imagen: "/img/productos/coffee-large.jpg",  stock: true },
    ],
  },
  {
    idTienda: 2,
    nombre: "STARBUCKS",
    ubicacion: "ULima - Edificio E",
    logo: "/img/tiendas/starbucks.jpg",
    catalogo: [
      { idProducto: 201, nombre: "Café Alto",   precio: 9,  imagen: "/img/productos/coffee-alto.jpg",   stock: true },
      { idProducto: 202, nombre: "Café Grande", precio: 11, imagen: "/img/productos/coffee-grande.jpg", stock: true },
      { idProducto: 203, nombre: "Café Venti",  precio: 13, imagen: "/img/productos/coffee-venti.jpg",  stock: true },
    ],
  },
  {
    idTienda: 3,
    nombre: "FRUTIX",
    ubicacion: "ULima - Boulevard",
    logo: "/img/tiendas/frutix.jpg", // coloca una imagen en public/img/tiendas/frutix.jpg
    catalogo: [
      // Usa de momento imágenes de coffee como placeholder si no tienes frutas
      { idProducto: 301, nombre: "Jugo de Fresa", precio: 10, imagen: "/img/productos/coffee-small.jpg",  stock: true },
      { idProducto: 302, nombre: "Jugo de Mango", precio: 12, imagen: "/img/productos/coffee-medium.jpg", stock: true },
      { idProducto: 303, nombre: "Jugo Mixto",    precio: 13, imagen: "/img/productos/coffee-large.jpg",  stock: true },
    ],
  },
];

const KEY = "tiendas";
function loadTiendas(): Tienda[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Tienda[];
  } catch {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return seed;
  }
}
function saveTiendas(tiendas: Tienda[]) {
  localStorage.setItem(KEY, JSON.stringify(tiendas));
}

// ====== API mock persistente ======
export const listarTiendas = async (): Promise<Tienda[]> => Promise.resolve(loadTiendas());

export const obtenerTienda = async (id: number): Promise<Tienda | undefined> => {
  const t = loadTiendas().find(t => t.idTienda === id);
  return Promise.resolve(t);
};

export function setProductoStock(tiendaId: number, idProducto: number, stock: boolean) {
  const tiendas = loadTiendas();
  const t = tiendas.find(x => x.idTienda === tiendaId);
  if (!t) return;
  const p = t.catalogo.find(p => p.idProducto === idProducto);
  if (p) p.stock = stock;
  saveTiendas(tiendas);
}

export function setProductoPrecio(tiendaId: number, idProducto: number, precio: number) {
  const tiendas = loadTiendas();
  const t = tiendas.find(x => x.idTienda === tiendaId);
  if (!t) return;
  const p = t.catalogo.find(p => p.idProducto === idProducto);
  if (p) p.precio = precio;
  saveTiendas(tiendas);
}

export function addProducto(tiendaId: number, data: { nombre: string; precio: number; imagen: string; stock?: boolean }) {
  const tiendas = loadTiendas();
  const t = tiendas.find(x => x.idTienda === tiendaId);
  if (!t) return;
  const maxId = Math.max(0, ...t.catalogo.map(p => p.idProducto));
  const nuevo = { idProducto: maxId + 1, stock: true, ...data };
  t.catalogo.push(nuevo);
  saveTiendas(tiendas);
  return nuevo;
}
