const Sequelize = require('sequelize');
const sequelize = require('../connections/mysql');
const Sensors = require('../models/SensorsModel');
const Alerts = require('../models/AlertsModel');

const Devices = sequelize.define('devices', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
    },
    clientId: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    ttn_topic_to_subscribe: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});
Devices.hasMany(Sensors, { onDelete: 'cascade' });
Sensors.belongsTo(Devices, { onDelete: 'cascade' });

module.exports = Devices;