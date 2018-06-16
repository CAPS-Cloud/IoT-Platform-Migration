const Sequelize = require('sequelize');
const sequelize = require('../connections/mysql');

module.exports = sequelize.define('devices', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});
