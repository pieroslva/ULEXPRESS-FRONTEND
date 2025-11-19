'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. TIENDAS
    await queryInterface.createTable('tiendas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      ubicacion: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
    }, { timestamps: false });

    // 2. PRODUCTOS (FK → tiendas.id)
    await queryInterface.createTable('productos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tienda_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tiendas',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      imagen_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      stock: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    }, { timestamps: false });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos');
    await queryInterface.dropTable('tiendas');
  }
};
