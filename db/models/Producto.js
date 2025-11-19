const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Producto = sequelize.define('Producto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tiendaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tienda_id',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    imagen_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    stock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'productos',
    timestamps: false,
  });

  Producto.associate = (models) => {
    Producto.belongsTo(models.Tienda, {
      foreignKey: 'tiendaId',
      as: 'tienda'
    });
  };

  return Producto;
};
