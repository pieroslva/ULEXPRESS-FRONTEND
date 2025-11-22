export const API_URL = "http://localhost:3000/api";

// Helper para obtener el token guardado (lo usaremos luego)
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  } : { 
    'Content-Type': 'application/json' 
  };
};