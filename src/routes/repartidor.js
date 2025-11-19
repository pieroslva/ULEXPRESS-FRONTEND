// src/routes/repartidor.js

const express = require('express');
const router = express.Router();
const verifyToken = require('../Middleware/authMiddleware');
const pedidoController = require('../Controllers/PedidoController');

// Middleware para verificar que el rol sea 'repartidor'
const isRepartidor = (req, res, next) => {
    if (req.user.rol !== 'repartidor') {
        return res.status(403).json({ message: 'Acceso prohibido. Rol requerido: Repartidor.' });
    }
    next();
};

// GET /api/repartidor/pedidos/disponibles (Pedidos con estado CREADO)
router.get('/pedidos/disponibles', verifyToken, isRepartidor, pedidoController.getAvailableOrders);

// PATCH /api/repartidor/pedidos/:id/aceptar
router.patch('/pedidos/:id/aceptar', verifyToken, isRepartidor, pedidoController.acceptOrder);

// [Aquí irán otras rutas de repartidor, como ver asignados o marcar como entregado]

module.exports = router;