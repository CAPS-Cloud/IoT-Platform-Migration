const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Devices = require('../models/DevicesModel');
const jwt = require('jsonwebtoken');
const { AUTHENTICATION_SECRET, ROOT_USERNAME, ROOT_PASSWORD } = require('../secrets');
const bcrypt = require('bcryptjs');
const BaseController =  require('./BaseController');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


controller = new class extends BaseController {
    constructor() {
        super(Devices);
    }
}

module.exports = {
    getAll: controller.getAll.bind(controller),
    add: controller.add.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
}
