// src/Controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../../db/models'); // Asegúrate que la ruta sea correcta a tu modelo Usuario

// La clave secreta para firmar los JWT
const JWT_SECRET = process.env.JWT_SECRET; 

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    // 1. Obtener datos del frontend (Login.tsx)
    const { codigo, password, nombre, rol, email, tiendaId } = req.body;

    // 2. Verificar campos requeridos
    if (!codigo || !password || !nombre || !rol) {
      return res.status(400).json({ message: 'Faltan campos obligatorios: codigo, password, nombre, rol.' });
    }

    // 3. Verificar si el usuario ya existe (por su 'codigo' unico)
    const existingUser = await Usuario.findOne({ where: { codigo } });
    if (existingUser) {
      return res.status(409).json({ message: 'El código de usuario ya está registrado.' });
    }

    // 4. Hashear la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 5. Crear el nuevo usuario en la DB
    const newUser = await Usuario.create({
      codigo,
      nombre,
      rol,
      email,
      tiendaId: rol === 'tienda' ? tiendaId : null, // Solo asignar tiendaId si el rol es 'tienda'
      password_hash,
    });

    // 6. Respuesta exitosa (no enviar el hash)
    return res.status(201).json({
      id: newUser.id,
      codigo: newUser.codigo,
      nombre: newUser.nombre,
      rol: newUser.rol,
      message: 'Usuario registrado exitosamente.'
    });

  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({ message: 'Error interno del servidor al registrar.' });
  }
};

// [Aquí irá el login en el siguiente paso]

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { codigo, password } = req.body;

    // 1. Buscar el usuario por su código
    const user = await Usuario.findOne({ where: { codigo } });

    // 2. Verificar si el usuario existe
    if (!user) {
      return res.status(404).json({ message: 'Usuario o código incorrecto.' });
    }

    // 3. Verificar la contraseña con el hash guardado
    // Utilizamos el método validPassword que definimos en db/models/user.js
    const isMatch = await user.validPassword(password); 

    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    // 4. Generar el Token JWT
    // Incluimos los datos que tu frontend (auth.store.ts) necesita: id, codigo, rol y tiendaId
    const token = jwt.sign(
      { 
        id: user.id, 
        codigo: user.codigo,
        rol: user.rol,
        tiendaId: user.tiendaId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // El token expira en 1 día
    );

    // 5. Respuesta exitosa: enviamos el token y los datos del usuario
    return res.json({
      token,
      user: {
        id: user.id,
        codigo: user.codigo,
        nombre: user.nombre,
        rol: user.rol,
        tiendaId: user.tiendaId,
      },
    });

  } catch (error) {
    console.error('Error en el login:', error);
    return res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
  }
};