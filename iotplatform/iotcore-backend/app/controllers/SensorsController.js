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
const elasticClient = require('../connections/elasticsearch');
const axios = require('axios');
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

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

                // get all jars - done
                // GET http://iot.pcxd.me:8081/jars/
                axios.get('http://iot.pcxd.me:8081/jars').then(response => {
                    if(response.data.files.length>0){
                        var jarId = response.data.files[0].id,
                            fixedPart1 = '/run?allowNonRestoredState=false&entry-class=&parallelism=&program-args=-topic%3D',
                            fixedPart2 = '&savepointPath=',
                            homepage = 'http://iot.pcxd.me:8081/jars/',
                            finalURL = homepage+jarId+fixedPart1+device_id_sensor_id+fixedPart2;
                        axios.post(finalURL).then(response => {
                            console.log('******RESPONSE',response);
                          })
                          .catch(function (error) {
                            console.log(error);
                          });
                    }
                    else{
                        var fs = require('fs');
                        var request = require('request');
                        request.post({
                            url: 'http://iot.pcxd.me:8081/jars/upload',
                            formData: {
                                file: fs.createReadStream('/home/mohammad/Documents/iotplatform/iotplatform/flink/target/flink-kafka-1.0.jar'),
                                filetype: 'jar',
                                filename: 'flink-kafka-1.0',
                            },
                        }, function(error, response, body) {
                            console.log(body);
                        });
                    }
                })                      
                .catch(error => console.log(error));

                // upload jar if not exist - not done
                // POST http://iot.pcxd.me:8081/jars/upload

                // get jar id
                // GET http://iot.pcxd.me:8081/jars/

                // run job service
                // POST http://iot.pcxd.me:8081/jars/e8e9cc45-f6da-481c-a9da-5ec886894211_refinement-1.0-SNAPSHOT-x86.jar/run?allowNonRestoredState=false&entry-class=&parallelism=&program-args=-topic%3D1_2&savepointPath=
                
                // "test"+varial+"test"

                return res.json(res2);
            });
        }).catch(err => {
            console.log("err", err);
            return responseError(res, err);        
        });
        
    }
}