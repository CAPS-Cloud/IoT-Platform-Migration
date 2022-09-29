const Sequelize = require('sequelize');
const sequelize = require('../connections/mysql');
const Consumers = require('./ConsumersModel');
const Predictions = require('./PredictionsModel');
const Alerts = require('./AlertsModel');


const Sensors = sequelize.define('sensors',{
    name:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.STRING,
    },
    flink_jar: {
        type: Sequelize.BLOB("long"),
    },
});

Sensors.belongsToMany(Consumers, { through: 'ConsumersSensors', onDelete: 'cascade' });
Consumers.belongsToMany(Sensors, { through: 'ConsumersSensors' });

Sensors.belongsToMany(Predictions, { through: 'PredictionsSensors'});
Predictions.belongsToMany(Sensors, { through: 'PredictionsSensors'});

Sensors.hasMany(Alerts, { onDelete: 'cascade' });
Alerts.belongsTo(Sensors,{ onDelete: 'cascade'});

module.exports = Sensors;