// src/controllers/pedidoController.js

const { Pedido, ItemPedido } = require('../../db/models');
const { v4: uuidv4 } = require('uuid'); // Necesitarás 'uuid' para generar el ID como en el frontend
// Asegúrate de instalar uuid: npm install uuid

// POST /api/pedidos - Crea un nuevo pedido (CHECKOUT)
exports.createOrder = async (req, res) => {
    // req.user viene del middleware JWT (req.user.id es el ID del estudiante)
    const { items, subtotal, delivery, total, metodoPago } = req.body;
    const usuarioId = req.user.id; // ID del estudiante logueado

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'El pedido no puede estar vacío.' });
    }

    try {
        // 1. Generar un ID único (como lo hace el frontend con crypto.randomUUID())
        const pedidoId = uuidv4(); 

        // 2. Crear el Pedido (la orden principal)
        const newPedido = await Pedido.create({
            id: pedidoId,
            usuarioId,
            repartidorId: null, // Sin repartidor asignado al inicio
            metodoPago,
            subtotal,
            delivery,
            total,
            estado: 'CREADO',
        });

        // 3. Preparar los ítems del pedido (el carrito)
        const itemsToSave = items.map(item => ({
            pedidoId: pedidoId,
            productoId: item.producto.idProducto, // El ID del producto
            nombreSnapshot: item.producto.nombre, 
            precioUnitarioSnapshot: item.producto.precio,
            cantidad: item.cantidad,
        }));
        
        // 4. Crear los ItemPedido
        await ItemPedido.bulkCreate(itemsToSave);

        // 5. Devolver el objeto Pedido que el frontend espera (CheckoutFacade.ts)
        return res.status(201).json({
            id: newPedido.id,
            fecha: newPedido.fecha,
            estado: newPedido.estado,
            total: Number(newPedido.total),
            delivery: Number(newPedido.delivery),
            subtotal: Number(newPedido.subtotal),
            metodo: newPedido.metodoPago,
            // Nota: No devolvemos 'items' aquí, el frontend confía en que los guardamos.
        });

    } catch (error) {
        console.error('Error al crear pedido:', error);
        return res.status(500).json({ message: 'Error interno al procesar el pedido.' });
    }

    
};

// src/controllers/pedidoController.js (Continuación)

// ... (requires, exports.createOrder, exports.getHistory)

// GET /api/pedidos/repartidor/disponibles
// Busca pedidos con estado 'CREADO' y que no tienen repartidor asignado.
exports.getAvailableOrders = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            where: {
                estado: 'CREADO',
                repartidorId: null,
            },
            // Incluir el cliente (estudiante) y la tienda donde recoger el pedido.
            include: [
                { model: ItemPedido, as: 'items', include: [{ model: Producto, as: 'producto', include: ['tienda'] }] },
                { model: Usuario, as: 'cliente', attributes: ['nombre', 'codigo'] }
            ],
            attributes: ['id', 'fecha', 'total', 'metodoPago'],
            order: [['fecha', 'ASC']]
        });

        // Formatear la respuesta para el Repartidor
        const response = pedidos.map(p => {
            // Asumiendo que todos los items son de la misma tienda (Simplificación de ULEXPRESS)
            const tienda = p.items[0]?.producto.tienda;

            return {
                id: p.id,
                fecha: p.fecha,
                total: Number(p.total),
                metodoPago: p.metodoPago,
                tienda: tienda ? tienda.nombre : 'Tienda Desconocida',
                ubicacionTienda: tienda ? tienda.ubicacion : '',
                cliente: p.cliente.nombre,
                destino: 'ULima - Edificio (pendiente de campo de entrega en Pedido)',
            };
        });

        return res.json(response);
    } catch (error) {
        console.error('Error al obtener pedidos disponibles:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// PATCH /api/pedidos/repartidor/:id/aceptar
// El repartidor acepta la entrega, cambiando el estado y asignando su ID.
exports.acceptOrder = async (req, res) => {
    // req.user viene del middleware JWT
    const repartidorId = req.user.id; 
    const pedidoId = req.params.id;

    try {
        const pedido = await Pedido.findByPk(pedidoId);

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido no encontrado.' });
        }
        
        // Regla: Solo se puede aceptar si está en estado CREADO y no tiene repartidor asignado
        if (pedido.estado !== 'CREADO' || pedido.repartidorId !== null) {
            return res.status(400).json({ message: 'El pedido ya fue aceptado o no está disponible.' });
        }

        // Actualizar el pedido
        pedido.repartidorId = repartidorId;
        pedido.estado = 'ACEPTADO';
        await pedido.save();

        return res.json({ message: 'Pedido aceptado y asignado correctamente.', pedido });

    } catch (error) {
        console.error('Error al aceptar pedido:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};