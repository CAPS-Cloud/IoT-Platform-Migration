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
    type: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: [['text', 'long', 'double']],
        },
    },
    unit: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

Sensors.belongsToMany(Consumers, { through: 'ConsumersSensors', onDelete: 'cascade' });
Consumers.belongsToMany(Sensors, { through: 'ConsumersSensors' });

module.exports = Sensors;