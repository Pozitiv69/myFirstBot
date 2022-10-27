const { Sequelize } = require('sequelize');

module.exports = new Sequelize('game_bot', 'admin', '0000', {
  host: 'localhost',
  port: '5432',
  dialect: 'postgres',
});
