const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Consumers = require('../models/ConsumersModel');
const Sensors = require('../models/SensorsModel');
const Devices = require('../models/DevicesModel');
const jwt = require('jsonwebtoken');
const { CONSUMER_SECRET } = require('../secrets');
const bcrypt = require('bcryptjs');
const BaseController =  require('./BaseController');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const controller = new class extends BaseController {
    constructor() {
        super(Consumers);
        this.findAllOptions = {
            include: [{ model: Sensors, include: [{ model: Devices }] }],
        }
    }

    key(req, res) {
        this.model.findOne({ where: { id: { [Op.eq]: req.params.id } } }).then(data => {
            if (data) {
                jwt.sign({ id: data.id }, CONSUMER_SECRET, (err, token) => {
                    return res.json({ token });
                });
            } else {
                return res.status(400).json({ name: 'ConsumerNotFound', errors: [{ message: 'Consumer not found' }] });
            }
        }).catch(err => responseError(res, err));
    }
}

module.exports = {
    getAll: controller.getAll.bind(controller),
    add: controller.add.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
    key: controller.key.bind(controller),
}
