const connection = require('../connections/mysql');
const { responseError, responseSystemError } = require('../utils/express_utils');
const Sensors = require('../models/SensorsModel');
const Devices = require('../models/DevicesModel')
const jwt = require('jsonwebtoken');
const { SENSOR_SECRET } = require('../secrets');
const bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const kafka = require('kafka-node');
const elasticsearch = require('elasticsearch');
const elasticClient = require('../connections/elasticsearch');

module.exports = {

    getAll(req, res) {
        Sensors.findAll({ where: { deviceId: { [Op.eq]: req.params.id } } }).then(data => {
            if(data){
            return res.status(200).json({ result: data });
            }
            else {
                return res.status(400).json({ name: 'NoSensorsExist', errors: [{ message: 'No Sensors Exist' }] });
            }
        }).catch(err => {
            return responseError(res, err);
        });
    },
    pre_update(data, callback) {
        callback(data);
    },

    get(req, res) {
        Sensors.findAll({ where: { deviceId: { [Op.eq]: req.params.device_id }, id: { [Op.eq]: req.params.id } } }).then(data => {
            if(data){
            return res.status(200).json({ result: data });
            }
            else {
                return res.status(400).json({ name: 'NoSensorsExist', errors: [{ message: 'No Sensors Exist' }] });
            }
        }).catch(err => {
            return responseError(res, err);
        });
    },
    pre_update(data, callback) {
        callback(data);
    },

    update(req, res) {
        Devices.findOne({ where: { id: { [Op.eq]: req.params.device_id } } }).then(data => {
            if(data){
                delete req.body.id;
                Sensors.update(req.body, { where: { id: { [Op.eq]: req.params.id } } }).then(data2 => {
                    return res.status(200).json({ result: data2 });
                }).catch(err => {
                    return responseError(res, err);
                });
            }
        });
    },

    delete(req, res) {
        Devices.findOne({ where: { id: { [Op.eq]: req.params.device_id } } }).then(data => {
            if(data){
                Sensors.destroy({ where: { id: { [Op.eq]: req.params.id } } }).then(data2 => {
                    return res.status(200).json({ result: data2 });
                }).catch(err => {
                    return responseError(res, err);
                });
            } else {
                return res.status(400).json({ name: 'DeviceNotFound', errors: [{ message: 'Device not found' }] });
            }
        });
    },

    add(req, res) {
        var Producer = kafka.Producer,
        client = new kafka.Client('iot.pcxd.me:2181/'),
        producer = new Producer(client)
        Devices.findById(req.params.id).then(device => {
            console.log("device id",device.id);
            
            Sensors.create({ name: req.body.name, description: req.body.description, unit: req.body.unit, path: req.body.path, deviceId: device.id }).then(res2 => {
                var device_id_sensor_id = device.id + '_' + res2.id;
                elasticClient.indices.create({
                    index: device_id_sensor_id
                    },function(err,resp,status) {
                    if(err) {
                        console.log(err);
                    }
                    else {
                        console.log("create",resp); 
                        var body = {
                            device_id_sensor_id:{
                                properties:{
                                reading         : {"type" : "string", "index" : "not_analyzed"},
                                sensorId        : {"type" : "string", "index" : "not_analyzed"},
                                sensorGroup   : {"type" : "string", "index" : "not_analyzed"},
                                date         : {"type" : "long", "index" : "not_analyzed"}
                                    }
                                }
                        }
                        
                        elasticClient.indices.putMapping({index:device_id_sensor_id, type:"device_id_sensor_id", body:body});
                    }
                });

                client.on("error", (err) => {
                    console.log(err);
                
                });

                producer.on("error", (err) => {
                    console.log(err);
                
                });
        
                producer.on('ready', () => {
                    producer.on("error", (err) => {
                        console.log(err);
                    })
        
                    producer.createTopics([req.body.topic], true, (err, data) => {
                        if (err) {
                            console.log("err", err);
                        }
                        else {
                            console.log("data", data);
                        } 
                    });
                });

                

                return res.json(res2);
            });
        }).catch(err => {
            console.log("err", err);
            return responseError(res, err);        
        });
        
    }
}
