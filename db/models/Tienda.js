// db/models/Tienda.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tienda = sequelize.define('Tienda', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ubicacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    logo_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'tiendas',
    timestamps: false,
  });

  Tienda.associate = (models) => {
    // Una tienda tiene muchos productos
    Tienda.hasMany(models.Producto, { foreignKey: 'tiendaId', as: 'catalogo' });

    // Una tienda tiene un administrador (User)
    Tienda.hasOne(models.User, { foreignKey: 'tiendaId', as: 'admin' });
  };

  return Tienda;
};
