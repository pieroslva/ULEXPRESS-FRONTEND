import { create } from "zustand"; // <--- ¡Esta línea es la que faltaba!
import { loginUser, type User } from "../services/AuthService";

type Sesion = { 
  nombre: string; 
  codigo: string; 
  token: string; 
  rol?: User["rol"]; 
  tiendaId?: number 
};

export const useAuth = create<{
  sesion?: Sesion;
  bootstrapped: boolean;
  error?: string;
  cargarSesion: () => void;
  login: (codigo: string, pass: string) => Promise<void>;
  logout: () => void;
}>(set => ({
  sesion: (() => {
    try { return JSON.parse(localStorage.getItem("sesion") || "null") || undefined; }
    catch { return undefined; }
  })(),
  bootstrapped: true,
  error: undefined,
  cargarSesion: () => {},

  login: async (codigo, pass) => {
    try {
      const user = await loginUser(codigo, pass);
      
      // Validación: Si no hay usuario o no hay token, fallamos
      if (!user || !user.token) { 
        set({ error: "Credenciales inválidas o error de servidor" }); 
        throw new Error("INVALID"); 
      }

      // 1. Guardamos el TOKEN por separado (para las peticiones API)
      localStorage.setItem("token", user.token);

      // 2. Creamos el objeto sesión para la UI del frontend
      const s: Sesion = {
        codigo: user.codigo, 
        nombre: user.nombre, 
        rol: user.rol, 
        tiendaId: user.tiendaId,
        token: user.token
      };

      // 3. Guardamos la sesión y actualizamos el estado global
      localStorage.setItem("sesion", JSON.stringify(s));
      set({ sesion: s, error: undefined });

    } catch (e) {
      console.error(e);
      set({ error: "Error al iniciar sesión" });
      throw e;
    }
  },

  logout: () => { 
    localStorage.removeItem("sesion"); 
    localStorage.removeItem("token"); 
    set({ sesion: undefined }); 
  },
}));