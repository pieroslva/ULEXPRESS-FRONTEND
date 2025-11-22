import { API_URL } from "./api";

export type User = {
  id?: number;
  codigo: string;
  nombre: string;
  rol?: "alumno" | "repartidor" | "admin" | "tienda";
  tiendaId?: number;
  email?: string;
  token?: string; // Agregamos token al tipo
};

// Login Real contra el Backend
export async function loginUser(codigo: string, pass: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        codigo: codigo, 
        password: pass // El backend espera "password", no "pass"
      }),
    });

    if (!response.ok) {
      return null; // Credenciales incorrectas
    }

    const data = await response.json();
    
    // El backend devuelve: { token: "...", user: { id, nombre, rol } }
    // Combinamos todo para devolver un objeto User completo al store
    return {
      ...data.user,
      codigo: codigo, // El backend no devuelve codigo en el body user, lo recuperamos del input
      token: data.token,
      tiendaId: data.user.tiendaId // Asegúrate de que el back devuelva esto o sácalo del token decodificado
    };
  } catch (error) {
    console.error("Error de conexión:", error);
    return null;
  }
}

// Registro Real contra el Backend
export async function registerUser(userData: any): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error al registrar");
  }

  const data = await response.json();
  return data.user;
}