const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Consumers = require('../models/ConsumersModel');
const jwt = require('jsonwebtoken');
const { CONSUMER_SECRET } = require('../secrets');
const bcrypt = require('bcryptjs');
const BaseController =  require('./BaseController');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


controller = new class extends BaseController {
    constructor() {
        super(Consumers);
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
        }).catch(err => {
            return responseError(res, err);
        });
    }
}

module.exports = {
    getAll: controller.getAll.bind(controller),
    add: controller.add.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
    key: controller.key.bind(controller),
}
