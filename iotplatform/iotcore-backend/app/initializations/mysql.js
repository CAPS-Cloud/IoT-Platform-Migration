
const Users = require('../models/UsersModel');
const Devices = require('../models/DevicesModel');
const Sensors = require('../models/SensorsModel');
const Consumers = require('../models/ConsumersModel');
const ConsumerSensors = require('../models/ConsumerSensorsModel');
const sequelize = require('../connections/mysql');


async function syncDataModels() {

   await sequelize.drop();
   await sequelize.sync({ force: true });
}

syncDataModels();