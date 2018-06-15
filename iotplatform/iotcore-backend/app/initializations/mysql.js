
const Users = require('../models/UsersModel');


async function syncDataModels() {
    await Users.sync({force: true});
}

syncDataModels();
