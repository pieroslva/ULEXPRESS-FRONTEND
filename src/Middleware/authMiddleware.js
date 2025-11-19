// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');

// Función que verifica si el usuario tiene un Token JWT válido
const verifyToken = (req, res, next) => {
    // 1. Obtener el token del encabezado 'Authorization' (ej: Bearer <token>)
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No hay token proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. Verificar y decodificar el token usando la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Adjuntar los datos del usuario (ID, rol, etc.) a la solicitud (req)
        // Esto permite a los controladores saber quién hizo la petición
        req.user = decoded; 
        
        next(); // Pasar al siguiente middleware o al controlador
    } catch (error) {
        // Token inválido, expirado, etc.
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

module.exports = verifyToken;

