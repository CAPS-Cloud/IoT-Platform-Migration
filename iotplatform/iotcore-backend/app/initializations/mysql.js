
const Users = require('../models/UsersModel');
const Devices = require('../models/DevicesModel');


async function syncDataModels() {
    await Users.sync({ force: true });
    await Devices.sync({ force: true });
}

syncDataModels();
