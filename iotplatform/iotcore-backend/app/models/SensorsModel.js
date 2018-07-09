const Sequelize = require('sequelize');
const sequelize = require('../connections/mysql');
const Device = require('../models/DevicesModel');
const Consumers = require('./ConsumersModel');

const Sensors = sequelize.define('sensors',{
    name:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
    },
    unit: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    path: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

Sensors.belongsToMany(Consumers, {through: 'ConsumersSensors'});
Consumers.belongsToMany(Sensors, {through: 'ConsumersSensors'});

module.exports = Sensors;