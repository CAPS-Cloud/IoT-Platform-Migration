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
const flink = require('../connections/flink');
const { elasticClient } = require('../connections/elasticsearch');
const axios = require('axios');
const fs = require('fs');
const request = require('request');

const ELASTICSEARCH_HOST = require('../connections/elasticsearch').host;
const ELASTICSEARCH_HOST_DOMAIN = ELASTICSEARCH_HOST.split(':')[0];
const ELASTICSEARCH_BIN_PORT = require('../connections/elasticsearch').bin_port;
const KAFKA_HOST = require('../connections/kafka').host;
const ZOOKEEPER_HOST = require('../connections/zookeeper');

function addElasticsearchIndex(topic) {
    console.log("Adding elasticsearch index", topic);
    return new Promise(function (resolve, reject) {
        elasticClient.indices.create({
            index: topic,
        }, function (err, resp, status) {
            if (err) {
                reject(err);
            }
            else {
                var body = {
                    sensorReading: {
                        properties: {
                            timestamp: { "type": "date" },
                            sensor_id: { "type": "text" },
                            value: { "type": "text" },
                        },
                    },
                }

                elasticClient.indices.putMapping({ index: topic, type: "sensorReading", body: body },
                    function (err, resp, status) {
                        if (err) {
                            reject(err);
                        } else {
                            console.log("Done adding elasticsearch index", topic);
                            resolve(resp);
                        }
                    }
                );
            }
        });
    });
}

function deleteElasticsearchIndex(topic) {
    console.log("Deleting elasticsearch index", topic);
    return new Promise(function (resolve, reject) {
        elasticClient.indices.delete({
            index: topic,
        }, function (err, resp, status) {
            if (err) {
                reject(err);
            }
            else {
                console.log("Done deleting elasticsearch index", topic);
                resolve(resp);
            }
        });
    });
}

function addFlinkJob(topic) {
    console.log("Adding flink job", topic);
    return new Promise(function (resolve, reject) {
        axios.get(`${flink}jars/`).then(response => {
            if (response.data.files.length > 0) {
                console.log("Run flink job", topic);
                const jarId = response.data.files[0].id;
                const programArgs = `--elasticsearch "${ELASTICSEARCH_HOST_DOMAIN}" --elasticsearch_port ${ELASTICSEARCH_BIN_PORT} --topic ${topic} --bootstrap.servers "${KAFKA_HOST}" --zookeeper.connect "${ZOOKEEPER_HOST}" --groud.id flink_job`;
                axios.post(`${flink}jars/${jarId}/run?allowNonRestoredState=false&entry-class=&parallelism=&program-args=${encodeURIComponent(programArgs)}&savepointPath=`).then(response => {
                    console.log("Ran flink job", topic);
                    resolve(response);
                }).catch(function (err2) {
                    reject(err2);
                });
            }
            else {
                console.log("Uploading flink jar");
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
                            console.log("Uploaded flink jar");
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
    console.log("Canceling flink job", topic);
    return new Promise(function (resolve, reject) {
        axios.get(`${flink}joboverview/`).then(res => {
            const jobs = res.data["running"].concat(res.data["finished"]);

            for (var i = 0; i < jobs.length; i++) {
                const job = jobs[i];

                if (job.name == topic) {
                    axios.delete(`${flink}jobs/${job.jid}/cancel/`).then(res => {
                        console.log("Done canceling flink job", topic);
                        resolve(res);
                    }).catch(err => reject(err));
                    return;
                }
            }
            resolve(null);
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
                    var topic = `${device.id}_${sensor.id}`;

                    // Add Elasticsearch Index, then Kafka Topic, then Flink Job asynchronously.
                    addElasticsearchIndex(topic).then(() => {
                        addTopic(topic).then(() => {
                            addFlinkJob(topic).catch(err => console.error(err));
                        }).catch(err => console.error(`Kafka topic creation error with exit code: ${err}`));
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
