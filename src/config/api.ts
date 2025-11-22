import axios from "axios";

export const API_URL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use((config) => {
  const sesionStr = localStorage.getItem("sesion");

  if (sesionStr) {
    try {
      const sesion = JSON.parse(sesionStr);

      if (sesion?.token) {
        config.headers.Authorization = `Bearer ${sesion.token}`;
      }
    } catch (e) {
      console.error("Error al leer token", e);
    }
  }

  return config;
});
