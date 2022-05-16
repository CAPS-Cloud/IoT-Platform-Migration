const connection = require('../connections/mysql');
const {responseError, responseSystemError} = require('../utils/express_utils');
const Users = require('../models/UsersModel');
const Sensors = require('../models/SensorsModel');
const Devices = require('../models/DevicesModel')
const jwt = require('jsonwebtoken');
const {SENSOR_SECRET} = require('../secrets');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {addTopic, deleteTopic} = require('../connections/kafka');
//const {addFlinkJob, deleteFlinkJob} = require('../connections/flink');
const {addConnectJob, deleteConnectJob} = require('../connections/connect');

const {addElasticsearchIndex, deleteElasticsearchIndex} = require('../connections/elasticsearch');
const fs = require('fs');

const controller = new class {

    getAll(req, res) {
        Users.findOne({where: {id: {[Op.eq]: req.authenticated_as.id}}}).then(user => {
            if (!user) {
                return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
            } else {
                Devices.findOne({
                    where: {
                        id: req.params.device_id,
                        userId: {[Op.eq]: user.id}
                    }
                }).then(device => {
                    if (!device) {
                        return res.status(400).json({name: 'DeviceNotFound', errors: [{message: 'Device not found'}]});
                    } else {
                        Sensors.findAll({where: {deviceId: {[Op.eq]: device.id},}}).then(datas => {
                            return res.status(200).json({result: datas});
                        }).catch(err => responseError(res, err));
                    }
                }).catch(err => responseError(res, err));
            }
        }).catch(err => responseError(res, err));
    }


    _isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    add(req, res) {
        Users.findOne({where: {id: {[Op.eq]: req.authenticated_as.id}}}).then(user => {
            if (!user) {
                return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
            } else {
                Devices.findOne({
                    where: {
                        id: req.params.device_id,
                        userId: {[Op.eq]: user.id}
                    }
                }).then(device => {
                    if (!device) {
                        return res.status(400).json({name: 'DeviceNotFound', errors: [{message: 'Device not found'}]});
                    } else if (!req.body.mapping) {
                        return res.status(400).json({
                            name: 'MappingIsRequired',
                            errors: [{message: 'Please enter mapping'}]
                        });
                    } else if (!this._isJsonString(req.body.mapping)) {
                        return res.status(400).json({
                            name: 'MappingIsNotValidJSON',
                            errors: [{message: 'Mapping is not valid JSON'}]
                        });
                    } else {
                        if (!!req.file) {
                            Sensors.create({
                                name: req.body.name, description: req.body.description,
                                deviceId: device.id
                            }).then(sensor => {
                                var topic = `${user.id}_${device.id}_${sensor.id}`;

                                // Add Elasticsearch Index, then Kafka Topic, then Flink Job asynchronously.
                                addElasticsearchIndex(topic, JSON.parse(req.body.mapping)).then(() => {
                                    addTopic(topic).then(() => {
                                        addConnectJob(topic).catch(err => console.error(err));
                                    }).catch(err => console.error(`Kafka topic creation error with exit code: ${err}`));
                                }).catch(err => console.error(err));

                                return res.json(sensor);
                            }).catch(err => responseError(res, err));
                        } else {
                                Sensors.create({
                                    name: req.body.name,
                                    description: req.body.description,
                                    deviceId: device.id
                                }).then(sensor => {
                                    var topic = `${user.id}_${device.id}_${sensor.id}`;

                                    // Add Elasticsearch Index, then Kafka Topic, then Flink Job asynchronously.
                                    addElasticsearchIndex(topic, JSON.parse(req.body.mapping)).then(() => {
                                        addTopic(topic).then(() => {
                                            addConnectJob(topic, ).catch(err => console.error(err));
                                        }).catch(err => console.error(`Kafka topic creation error with exit code: ${err}`));
                                    }).catch(err => console.error(err));

                                    return res.json(sensor);
                                }).catch(err => responseError(res, err));
                        }
                    }

                }).catch(err => responseError(res, err));
            }
        }).catch(err => responseError(res, err));
    }

    update(req, res) {
        Users.findOne({where: {id: {[Op.eq]: req.authenticated_as.id}}}).then(user => {
            if (!user) {
                return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
            } else {
                Devices.findOne({
                    where: {
                        id: req.params.device_id,
                        userId: {[Op.eq]: user.id}
                    }
                }).then(device => {
                    if (!device) {
                        return res.status(400).json({name: 'DeviceNotFound', errors: [{message: 'Device not found'}]});
                    } else {
                        Sensors.findOne({
                            where: {
                                deviceId: {[Op.eq]: device.id},
                                id: {[Op.eq]: req.params.id}
                            }
                        }).then(data => {
                            if (data) {
                                delete req.body.id;
                                Sensors.update(req.body, {where: {id: {[Op.eq]: req.params.id}}}).then(sensor => {
                                    return res.status(200).json({result: sensor});
                                }).catch(err => responseError(res, err));
                            } else {
                                return res.status(400).json({
                                    name: 'SensorNotFound',
                                    errors: [{message: 'Sensor not found'}]
                                });
                            }
                        });
                    }
                }).catch(err => responseError(res, err));
            }
        }).catch(err => responseError(res, err));
    }

    delete(req, res) {
        Users.findOne({where: {id: {[Op.eq]: req.authenticated_as.id}}}).then(user => {
            if (!user) {
                return res.status(400).json({name: 'UserNotFound', errors: [{message: 'User not found'}]});
            } else {
                Devices.findOne({
                    where: {
                        id: req.params.device_id,
                        userId: {[Op.eq]: user.id}
                    }
                }).then(device => {
                    if (!device) {
                        return res.status(400).json({name: 'DeviceNotFound', errors: [{message: 'Device not found'}]});
                    } else {
                        Sensors.findOne({
                            where: {
                                deviceId: {[Op.eq]: device.id},
                                id: {[Op.eq]: req.params.id}
                            }
                        }).then(data => {
                            if (data) {
                                Sensors.destroy({where: {id: {[Op.eq]: req.params.id}}}).then(sensor => {
                                    var topic = `${user.id}_${device.id}_${req.params.id}`;

                                    // Delete Connect Job, then Kafka Topic, then Elasticsearch Index asynchronously.
                                    deleteConnectJob(topic).then(() => {
                                        deleteTopic(topic).then(() => {
                                            deleteElasticsearchIndex(topic).catch(err => console.error(err));
                                        }).catch(err => console.error(`Kafka topic deletion error with exit code: ${err}`));
                                    }).catch(err => console.error(err));

                                    return res.status(200).json({result: sensor});
                                }).catch(err => responseError(res, err));
                            } else {
                                return res.status(400).json({
                                    name: 'SensorNotFound',
                                    errors: [{message: 'Sensor not found'}]
                                });
                            }
                        });
                    }
                }).catch(err => responseError(res, err));
            }
        }).catch(err => responseError(res, err));
    }
}

module.exports = {
    getAll: controller.getAll.bind(controller),
    add: controller.add.bind(controller),
    update: controller.update.bind(controller),
    delete: controller.delete.bind(controller),
};
