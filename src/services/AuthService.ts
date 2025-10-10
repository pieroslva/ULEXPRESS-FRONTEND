// src/services/AuthService.ts
export type User = {
  codigo: string;
  nombre: string;
  password: string;
  rol?: "alumno" | "repartidor" | "admin" | "tienda";
  tiendaId?: number; // ← si es rol tienda, a qué tienda gestiona
};

export const usersMock: User[] = [
  { codigo: "20194613", nombre: "Piero S.", password: "1234", rol: "alumno" },
  { codigo: "R001",     nombre: "Piero Rodrigo", password: "1234", rol: "repartidor" },
  // 👇 Usuarios rol tienda, cada uno apunta a una tienda por id
  { codigo: "TDUNKIN",   nombre: "Dunkin Admin",   password: "1234",   rol: "tienda", tiendaId: 1 },
  { codigo: "TSTAR",     nombre: "Starbucks Admin",password: "1234",     rol: "tienda", tiendaId: 2 },
  { codigo: "TFRUTIX",   nombre: "Frutix Admin",   password: "1234",   rol: "tienda", tiendaId: 3 },
];

export async function loginUser(codigo: string, pass: string): Promise<User | null> {
  const u = usersMock.find(u => u.codigo === codigo && u.password === pass);
  return Promise.resolve(u ?? null);
}
