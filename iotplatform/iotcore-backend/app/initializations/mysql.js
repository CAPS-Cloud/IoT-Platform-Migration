
const Users = require('../models/UsersModel');
const Devices = require('../models/DevicesModel');
const Sensors = require('../models/SensorsModel')


async function syncDataModels() {
    await Users.sync({ force: true });
    await Devices.sync({ force: true });
    await Sensors.sync({force:true});
}

syncDataModels();
