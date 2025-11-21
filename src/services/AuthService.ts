import { api } from "../config/api";

export type User = {
  id?: number; // El backend devuelve ID numérico
  codigo: string;
  nombre: string;
  rol: "alumno" | "repartidor" | "tienda" | "admin";
  tiendaId?: number;
  email?: string;
  token?: string; // El backend devuelve el token aquí o separado
};

// Login Real
export async function loginUser(codigo: string, pass: string): Promise<User | null> {
  try {
    const { data } = await api.post("/auth/login", { codigo, password: pass });
    
    // El backend devuelve { token, user: { id, nombre, rol... } }
    // Combinamos para guardar en sesión
    return {
      ...data.user,
      token: data.token
    };
  } catch (error) {
    console.error("Error en login:", error);
    return null;
  }
}

// Registro Real
export async function registerUser(newUser: any): Promise<User> {
  try {
    // El backend espera { codigo, nombre, password, rol, email, tiendaId? }
    const { data } = await api.post("/auth/register", newUser);
    return data.user;
  } catch (error: any) {
    console.error("Error en registro:", error);
    throw new Error(error.response?.data?.message || "Error al registrar");
  }
}