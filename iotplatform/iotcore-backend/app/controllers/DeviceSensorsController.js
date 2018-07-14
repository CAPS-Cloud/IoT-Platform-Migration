const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Sensors = require('../models/SensorsModel');
const Devices = require('../models/DevicesModel')
const jwt = require('jsonwebtoken');
const { SENSOR_SECRET } = require('../secrets');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const { producer } = require('../connections/kafka');
const flink = require('../connections/flink');
const elasticClient = require('../connections/elasticsearch');
const axios = require('axios');
const fs = require('fs');
const request = require('request');

function addElasticsearchIndex(topic) {
    return new Promise(function (resolve, reject) {
        elasticClient.indices.create({
            index: topic,
        }, function (err, resp, status) {
            if (err) {
                reject(err);
            }
            else {
                var body = {
                    sensor: {
                        properties: {
                            reading: { "type": "string", "index": "not_analyzed" },
                            sensorId: { "type": "string", "index": "not_analyzed" },
                            sensorGroup: { "type": "string", "index": "not_analyzed" },
                            date: { "type": "long", "index": "not_analyzed" },
                        },
                    },
                }

                elasticClient.indices.putMapping({ index: topic, type: "sensor", body: body },
                    function (err, resp, status) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(resp);
                        }
                    }
                );
            }
        });
    });
}

function deleteElasticsearchIndex(topic) {
    return new Promise(function (resolve, reject) {
        elasticClient.indices.delete({
            index: topic,
        }, function (err, resp, status) {
            if (err) {
                reject(err);
            }
            else {
                resolve(resp);
            }
        });
    });
}

function addKafkaTopic(topic) {
    return new Promise(function (resolve, reject) {
        producer.createTopics([req.body.topic], true, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

function addFlinkJob(topic) {
    return new Promise(function (resolve, reject) {
        axios.get(`${flink}jars/`).then(response => {
            if (response.data.files.length > 0) {
                const jarId = response.data.files[0].id;
                axios.post(`${flink}jars/${jarId}/run?allowNonRestoredState=false&entry-class=&parallelism=&program-args=-topic%3D${topic}&savepointPath=`).then(response => {
                    resolve(response);
                }).catch(function (err2) {
                    reject(err2);
                });
            }
            else {
                const upload_file = 'flink-kafka-1.0.jar';
                const filePath = './flink_jars/';
                fs.readFile(filePath + upload_file, function (_err, content) {
                    const boundary = "xxxxxxxxxx";
                    var data = "";
                    data += "--" + boundary + "\r\n";
                    data += "Content-Disposition: form-data; name=\"jarfile\"; filename=\"" + upload_file + "\"\r\n";
                    data += "Content-Type:application/octet-stream\r\n\r\n";

                    request({
                        method: 'post',
                        url: `${flink}jars/upload`,
                        headers: { "Content-Type": "multipart/form-data; boundary=" + boundary },
                        body: Buffer.concat([Buffer.from(data, "utf8"), new Buffer(content, 'binary'), Buffer.from("\r\n--" + boundary + "\r\n", "utf8")]),
                    }, function (err2, response, body) {
                        if (err2) {
                            reject(err2);
                        } else {
                            addFlinkJob(topic).then(res => {
                                resolve(res);
                            }).catch(err3 => {
                                reject(err3)
                            })
                        }
                    });
                });
            }
        }).catch(err => reject(err));
    });
}

function deleteFlinkJob(topic) {
    return new Promise(function (resolve, reject) {
        axios.get(`${flink}jobs/`).then(res => {
            const jobs = res.data["jobs-running"].concat(res.data["jobs-finished"]).concat(res.data["jobs-failed"]);

            for (var i = 0; i < jobs.length; i++) {
                const job = jobs[i];
                axios.get(`${flink}jobs/${job}/config/`).then(res => {
                    if (
                        res.data["user-config"] &&
                        res.data["user-config"]["program-args"] &&
                        res.data["user-config"]["program-args"].split("%2d")[1] == topic
                    ) {
                        axios.delete(`${flink}jobs/${job}/cancel/`).then(res => {
                            resolve(res);
                        }).catch(err => reject(err));
                    }
                }).catch(err => reject(err));
            }
        }).catch(err => reject(err));
    });
}

const controller = new class {

    getAll(req, res) {
        Sensors.findAll({ where: { deviceId: { [Op.eq]: req.params.id } } }).then(datas => {
            return res.status(200).json({ result: datas });
        }).catch(err => responseError(res, err));
    }

    add(req, res) {
        Devices.findById(req.params.id).then(device => {
            if (device) {
                Sensors.create({ name: req.body.name, description: req.body.description, unit: req.body.unit, path: req.body.path, deviceId: device.id }).then(sensor => {
                    var topic = device.id + '_' + sensor.id;

                    // Add Elasticsearch Index, then Kafka Topic, then Flink Job asynchronously.
                    addElasticsearchIndex(topic).then(() => {
                        //addKafkaTopic(topic).then(() => {
                            addFlinkJob(topic).catch(err => console.error(err));
                        //}).catch(err => console.error(err));
                    }).catch(err => console.error(err));

                    return res.json(sensor);
                }).catch(err => responseError(res, err));
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

                    // Delete Elasticsearch Index, then Kafka Topic, then Flink Job asynchronously.
                    deleteElasticsearchIndex(topic).then(() => {
                        // TODO Delete Kafka Topic
                        deleteFlinkJob(topic).catch(err => console.error(err));
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
