const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Devices = require('../models/DevicesModel');
const Sensors = require('../models/SensorsModel');
const jwt = require('jsonwebtoken');
const { DEVICE_SECRET } = require('../secrets');
const bcrypt = require('bcryptjs');
const BaseController =  require('./BaseController');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const controller = new class extends BaseController {
    constructor() {
        super(Devices);
        this.findAllOptions = {
            include: [{ model: Sensors }],
        }
    }

    key(req, res) {
        this.model.findOne({ where: { id: { [Op.eq]: req.params.id } } }).then(data => {
            if (data) {
                jwt.sign({ iis: 'iotplatform', sub: data.id }, DEVICE_SECRET, { algorithm: 'RS256' }, (err, token) => {
                    return res.json({ token });
                });
            } else {
                return res.status(400).json({ name: 'DeviceNotFound', errors: [{ message: 'Device not found' }] });
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
