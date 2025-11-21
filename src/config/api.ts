import axios from "axios";

// URL base de tu backend
const API_URL = "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor: Antes de cada petición, inyecta el Token si existe
api.interceptors.request.use((config) => {
  const sesionStr = localStorage.getItem("sesion");
  if (sesionStr) {
    try {
      const sesion = JSON.parse(sesionStr);
      if (sesion?.token) {
        config.headers.Authorization = `Bearer ${sesion.token}`;
      }
    } catch (e) {
      console.error("Error leyendo token", e);
    }
  }
  return config;
});