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
const { addTopic, deleteTopic } = require('../connections/kafka');
const { addFlinkJob, deleteFlinkJob } = require('../connections/flink');
const { addElasticsearchIndex, deleteElasticsearchIndex } = require('../connections/elasticsearch');

const controller = new class extends BaseController {
    constructor() {
        super(Devices);
        this.findAllOptions = {
            include: [{ model: Sensors }],
        }
    }

    pre_delete(req, res, callback) {
        Devices.findById(req.params.id, { include: [{ model: Sensors }] }).then(device => {
            if (device) {
                const DEVICE_ID = device.id;
                const SENSORS_ID = device.sensors.map(sensor => sensor.id);

                SENSORS_ID.forEach(sensor_id => {
                    const topic = `${DEVICE_ID}_${sensor_id}`;

                    // Delete Flink Job, then Kafka Topic, then Elasticsearch Index asynchronously.
                    deleteFlinkJob(topic).then(() => {
                        deleteTopic(topic).then(() => {
                            deleteElasticsearchIndex(topic).catch(err => console.error(err));
                        }).catch(err => console.error(`Kafka topic deletion error with exit code: ${err}`));
                    }).catch(err => console.error(err));
                });
                callback();
            } else {
                callback();
            }
        }).catch(err => responseError(res, err));
    }

    key(req, res) {
        this.model.findOne({ where: { id: { [Op.eq]: req.params.id } } }).then(data => {
            if (data) {
                jwt.sign({}, DEVICE_SECRET, { algorithm: 'RS256', issuer: 'iotplatform', subject: data.id.toString() }, (err, token) => {
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
