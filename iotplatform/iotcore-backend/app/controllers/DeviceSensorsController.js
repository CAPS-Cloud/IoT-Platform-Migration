const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Sensors = require('../models/SensorsModel');
const Devices = require('../models/DevicesModel')
const jwt = require('jsonwebtoken');
const { SENSOR_SECRET } = require('../secrets');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { addTopic, deleteTopic } = require('../connections/kafka');
const { addFlinkJob, deleteFlinkJob } = require('../connections/flink');
const { addElasticsearchIndex, deleteElasticsearchIndex } = require('../connections/elasticsearch');
const fs = require('fs');

const controller = new class {

    getAll(req, res) {
        Sensors.findAll({ where: { deviceId: { [Op.eq]: req.params.id } } }).then(datas => {
            return res.status(200).json({ result: datas });
        }).catch(err => responseError(res, err));
    }

    add(req, res) {
        Devices.findById(req.params.id).then(device => {
            if (device) {
                if (!!req.file) {
                    Sensors.create({ name: req.body.name, description: req.body.description, unit: req.body.unit, deviceId: device.id }).then(sensor => {
                        var topic = `${device.id}_${sensor.id}`;

                        // Add Elasticsearch Index, then Kafka Topic, then Flink Job asynchronously.
                        addElasticsearchIndex(topic).then(() => {
                            addTopic(topic).then(() => {
                                addFlinkJob(topic, `${topic}.jar`, req.file.buffer).catch(err => console.error(err));
                            }).catch(err => console.error(`Kafka topic creation error with exit code: ${err}`));
                        }).catch(err => console.error(err));

                        return res.json(sensor);
                    }).catch(err => responseError(res, err));
                } else {
                    const upload_file = 'flink-kafka-1.0.jar';
                    const filePath = './flink_jars/';
                    fs.readFile(filePath + upload_file, function (_err, content) {
                        Sensors.create({ name: req.body.name, description: req.body.description, unit: req.body.unit, deviceId: device.id }).then(sensor => {
                            var topic = `${device.id}_${sensor.id}`;

                            // Add Elasticsearch Index, then Kafka Topic, then Flink Job asynchronously.
                            addElasticsearchIndex(topic).then(() => {
                                addTopic(topic).then(() => {
                                    addFlinkJob(topic, `default.jar`, content).catch(err => console.error(err));
                                }).catch(err => console.error(`Kafka topic creation error with exit code: ${err}`));
                            }).catch(err => console.error(err));

                            return res.json(sensor);
                        }).catch(err => responseError(res, err));
                    });
                }
            } else {
                return res.status(400).json({ name: 'DeviceNotFound', errors: [{ message: 'Device not found' }] });
            }
        }).catch(err => responseError(res, err));
    }

    update(req, res) {
        Sensors.findOne({ where: { deviceId: { [Op.eq]: req.params.device_id }, id: { [Op.eq]: req.params.id } } }).then(data => {
            if (data){
                delete req.body.id;
                Sensors.update(req.body, { where: { id: { [Op.eq]: req.params.id } } }).then(sensor => {
                    return res.status(200).json({ result: sensor });
                }).catch(err => responseError(res, err));
            } else {
                return res.status(400).json({ name: 'SensorNotFound', errors: [{ message: 'Sensor not found' }] });
            }
        });
    }

    delete(req, res) {
        Sensors.findOne({ where: { deviceId: { [Op.eq]: req.params.device_id }, id: { [Op.eq]: req.params.id } } }).then(data => {
            if (data){
                Sensors.destroy({ where: { id: { [Op.eq]: req.params.id } } }).then(sensor => {
                    var topic = `${req.params.device_id}_${sensor.id}`;

                    // Delete Flink Job, then Kafka Topic, then Elasticsearch Index asynchronously.
                    deleteFlinkJob(topic).then(() => {
                        deleteTopic(topic).then(() => {
                            deleteElasticsearchIndex(topic).catch(err => console.error(err));
                        }).catch(err => console.error(`Kafka topic deletion error with exit code: ${err}`));
                    }).catch(err => console.error(err));

                    return res.status(200).json({ result: sensor });
                }).catch(err => responseError(res, err));
            } else {
                return res.status(400).json({ name: 'SensorNotFound', errors: [{ message: 'Sensor not found' }] });
            }
        });
    }
}

module.exports = {
    getAll: controller.getAll.bind(controller),
    add: controller.add.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
}
