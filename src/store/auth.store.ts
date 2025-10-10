import { create } from "zustand";
import { loginUser, type User } from "../services/AuthService";

type Sesion = { nombre: string; codigo: string; token: string; rol?: User["rol"]; tiendaId?: number };

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
    const user = await loginUser(codigo, pass);
    if (!user) { set({ error: "Credenciales inválidas" }); throw new Error("INVALID"); }
    const s: Sesion = {
      codigo: user.codigo, nombre: user.nombre, rol: user.rol, tiendaId: user.tiendaId,
      token: crypto.randomUUID()
    };
    localStorage.setItem("sesion", JSON.stringify(s));
    set({ sesion: s, error: undefined });
  },
  logout: () => { localStorage.removeItem("sesion"); set({ sesion: undefined }); },
}));
