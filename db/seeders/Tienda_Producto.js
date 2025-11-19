'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Insertar Tiendas
    await queryInterface.bulkInsert('tiendas', [
      { id: 1, nombre: 'DUNKIN DONUTS', ubicacion: 'ULima - Edificio D', logo_url: '/img/tiendas/dunkin.jpg' },
      { id: 2, nombre: 'STARBUCKS', ubicacion: 'ULima - Edificio E', logo_url: '/img/tiendas/starbucks.jpg' },
      { id: 3, nombre: 'FRUTIX', ubicacion: 'ULima - Boulevard', logo_url: '/img/tiendas/frutix.jpg' },
    ], {});

    // 2. Insertar Productos
    await queryInterface.bulkInsert('productos', [
      // -------------------
      // Productos para Dunkin
      // -------------------
      { tienda_id: 1, nombre: 'Café Pequeño', precio: 8.00, imagen_url: '/img/productos/coffee-small.jpg', stock: true },
      { tienda_id: 1, nombre: 'Café Mediano', precio: 10.00, imagen_url: '/img/productos/coffee-medium.jpg', stock: true },
      { tienda_id: 1, nombre: 'Café Grande',  precio: 12.00, imagen_url: '/img/productos/coffee-large.jpg',  stock: true },

      // -------------------
      // Productos para Starbucks
      // -------------------
      { tienda_id: 2, nombre: 'Café Alto',   precio: 9.00,  imagen_url: '/img/productos/coffee-alto.jpg',   stock: true },
      { tienda_id: 2, nombre: 'Café Grande', precio: 11.00, imagen_url: '/img/productos/coffee-grande.jpg', stock: true },
      { tienda_id: 2, nombre: 'Café Venti',  precio: 13.00, imagen_url: '/img/productos/coffee-venti.jpg',  stock: true },

      // -------------------
      // Productos para Frutix
      // -------------------
      { tienda_id: 3, nombre: 'Jugo de Fresa', precio: 10.00, imagen_url: '/img/productos/coffee-small.jpg', stock: true },
      { tienda_id: 3, nombre: 'Jugo de Mango', precio: 12.00, imagen_url: '/img/productos/coffee-medium.jpg', stock: true },
      { tienda_id: 3, nombre: 'Jugo Mixto',    precio: 13.00, imagen_url: '/img/productos/coffee-large.jpg', stock: true },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('productos', null, {});
    await queryInterface.bulkDelete('tiendas', null, {});
  }
};
