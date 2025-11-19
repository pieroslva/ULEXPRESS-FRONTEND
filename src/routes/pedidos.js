// src/routes/pedidos.js

const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/authMiddleware'); // Middleware de protección
const pedidoController = require('../Controllers/PedidoController');

// Ruta Protegida: Crear Pedido (Checkout)
router.post('/', verifyToken, pedidoController.createOrder); // POST /api/pedidos

// [Aquí irán otras rutas como Historial y Repartidor]

module.exports = router;