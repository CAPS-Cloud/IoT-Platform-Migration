const Sequelize = require('sequelize');
const sequelize = require('../connections/mysql');
const Sensors = require('../models/SensorsModel');

const Devices = sequelize.define('devices', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
    },
});
Devices.hasMany(Sensors);
Sensors.belongsTo(Devices);
// sequelize.sync();

module.exports = Devices;