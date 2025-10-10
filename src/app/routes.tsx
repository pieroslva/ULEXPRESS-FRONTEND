// src/app/routes.tsx
// src/app/routes.tsx
import { createBrowserRouter } from "react-router-dom";
import ProtectedLayout from "./ProtectedLayout";

// Auth / Home
import Login from "../pages/auth/Login";
import Home from "../pages/home/Home";

// Tiendas (cliente)
import TiendasList from "../pages/tiendas/TiendasList";
import TiendaDetalle from "../pages/tiendas/TiendaDetalle";

// Carrito / Checkout
import Carrito from "../pages/carrito/Carrito";
import Confirmacion from "../pages/checkout/Confirmacion";

// Extras (Soft II)
import Historial from "../pages/Historial/Historial";
import Alumno_Repartidor from "../pages/Alumno_Repartidor/Alumno_Repartidor";

// Panel Tienda (rol tienda)
import TiendaLayout from "../pages/TiendaPanel/TiendaLayout";
import TiendaStock from "../pages/TiendaPanel/TiendaStock.tsx";
import TiendaPrecios from "../pages/TiendaPanel/TiendaPrecios";
import TiendaNuevo from "../pages/TiendaPanel/TiendaNuevo";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      // Home
      { index: true, element: <Home /> },

      // Tiendas (cliente)
      { path: "tiendas", element: <TiendasList /> },
      { path: "tiendas/:id", element: <TiendaDetalle /> },

      // Carrito / Checkout
      { path: "carrito", element: <Carrito /> },
      { path: "checkout", element: <Confirmacion /> },

      // Extras
      { path: "historial", element: <Historial /> },
      { path: "alumno-repartidor", element: <Alumno_Repartidor /> },

      // Panel Tienda (solo visible si el usuario tiene rol "tienda")
      {
        path: "tienda",
        element: <TiendaLayout />,
        children: [
          { index: true, element: <TiendaStock /> },     // /tienda
          { path: "stock", element: <TiendaStock /> },   // /tienda/stock
          { path: "precios", element: <TiendaPrecios /> }, // /tienda/precios
          { path: "nuevo", element: <TiendaNuevo /> },   // /tienda/nuevo
        ],
      },
    ],
  },
]);
